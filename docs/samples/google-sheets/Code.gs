/**
 * Sweet Atelier — スプレッドシート → Shopify 商品 同期ツール（Phase 16d）
 *
 * 店舗運用者は「分かりやすい入力テーブル」（日本語見出し・1 バリアント 1 行）を編集するだけ。
 * メニュー［Shopify］→［ストアに同期］を押すと、Apps Script が Shopify Admin GraphQL API
 * （productSet ミューテーション）を直接叩いて、商品を作成／更新する。CSV のダウンロードや
 * 管理画面でのインポート作業は不要。handle 基準の冪等 upsert なので、何度押しても同じ結果。
 *
 * ［ストアに同期］のほか、ネットワーク不通時などのフォールバックとして
 * ［取込用 CSV をダウンロード］も残してある。
 *
 * --- セキュリティ ---
 * Admin API トークンは Script Properties に保存し、シート本体・リポジトリには絶対に書かない。
 * 必要スコープは write_products（在庫を書く場合は write_inventory も）。
 *
 * --- フィールド名がエラーになるとき ---
 * productSet / ProductVariantSetInput のフィールドは Admin API のバージョンで変わる（例: SKU が
 * variant 直下 → inventoryItem 配下へ移動）。userErrors のメッセージを「同期結果」列に出すので
 * それで調整する。スキーマの正確な確認は Claude Code + Shopify Dev MCP の
 * `introspect_admin_schema` が早い。API_VERSION を上げたらここを見直す。
 */

const API_VERSION = '2025-01';
const PROP_DOMAIN = 'SHOPIFY_SHOP_DOMAIN'; // 例: sweet-atelier-demo.myshopify.com
const PROP_TOKEN = 'SHOPIFY_ADMIN_TOKEN';  // カスタムアプリの Admin API アクセストークン
const OPTION_NAME = 'サイズ';
const STATUS_HEADER = '同期結果';

// ── 入力テーブルの日本語見出し → 内部キー ──
const FRIENDLY_HEADERS = {
  '商品名': 'title', 'ハンドル': 'handle', '説明': 'description', 'ベンダー': 'vendor',
  'カテゴリー': 'category', '商品タイプ': 'type', 'タグ': 'tags', 'サイズ': 'option',
  'SKU': 'sku', '価格': 'price', '在庫': 'qty', '重量(g)': 'grams', '画像URL': 'image',
  '画像ALT': 'imageAlt', 'SEOタイトル': 'seoTitle', 'SEO説明': 'seoDescription', '公開状態': 'visibility',
};
const PRODUCT_LEVEL = ['title', 'description', 'vendor', 'category', 'type', 'tags',
  'image', 'imageAlt', 'seoTitle', 'seoDescription', 'visibility'];

// Shopify 商品 CSV ヘッダー（フォールバックの CSV 出力用・2026-05 時点の現行表示名）
const SHOPIFY_HEADERS = [
  'Title', 'URL handle', 'Description', 'Vendor', 'Product category', 'Type', 'Tags',
  'Published on online store', 'Status', 'SKU', 'Option1 name', 'Option1 value', 'Price',
  'Charge tax', 'Inventory tracker', 'Inventory quantity', 'Continue selling when out of stock',
  'Weight value (grams)', 'Weight unit for display', 'Requires shipping', 'Fulfillment service',
  'Product image URL', 'Image position', 'Image alt text', 'SEO title', 'SEO description',
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Shopify')
    .addItem('ストアに同期', 'syncToShopify')
    .addSeparator()
    .addItem('接続設定（ストア・トークン保存）', 'setupConnection')
    .addItem('接続テスト', 'testConnection')
    .addSeparator()
    .addItem('取込用 CSV をダウンロード（フォールバック）', 'showDownloadDialog')
    .addToUi();
}

// ── 接続設定 ──────────────────────────────────────────────

/** ストアドメインと Admin API トークンを Script Properties に保存。 */
function setupConnection() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const d = ui.prompt('接続設定 (1/2)',
    'ストアの myshopify.com ドメインを入力（例: sweet-atelier-demo.myshopify.com）',
    ui.ButtonSet.OK_CANCEL);
  if (d.getSelectedButton() !== ui.Button.OK) return;
  const domain = d.getResponseText().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const t = ui.prompt('接続設定 (2/2)',
    'カスタムアプリの Admin API アクセストークン（shpat_… ）を貼り付け。\n' +
    '※トークンはシートには保存されず、Script Properties に安全に保管されます。',
    ui.ButtonSet.OK_CANCEL);
  if (t.getSelectedButton() !== ui.Button.OK) return;
  const token = t.getResponseText().trim();

  if (!domain || !token) { ui.alert('ドメインまたはトークンが空です。設定を中止しました。'); return; }
  props.setProperty(PROP_DOMAIN, domain);
  props.setProperty(PROP_TOKEN, token);
  ui.alert('保存しました。［接続テスト］で疎通を確認してください。');
}

/** ストア名を取得して疎通とトークンを確認。 */
function testConnection() {
  const ui = SpreadsheetApp.getUi();
  try {
    const data = shopifyGraphql('{ shop { name myshopifyDomain } }', {});
    ui.alert('接続 OK\nストア: ' + data.shop.name + '\n(' + data.shop.myshopifyDomain + ')');
  } catch (e) {
    ui.alert('接続エラー\n' + e.message);
  }
}

// ── メイン: 同期 ──────────────────────────────────────────

function syncToShopify() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();

  let parsed;
  try {
    parsed = readProducts(sheet);
  } catch (e) {
    ui.alert('入力エラー\n' + e.message);
    return;
  }
  const groups = parsed.groups;
  if (groups.length === 0) { ui.alert('同期する商品がありません。'); return; }

  const confirm = ui.alert('ストアに同期',
    groups.length + ' 商品を Shopify に作成／更新します。よろしいですか？\n' +
    '（handle 一致で更新、なければ新規作成。下書きは公開されません）',
    ui.ButtonSet.OK_CANCEL);
  if (confirm !== ui.Button.OK) return;

  let locationId = '';
  try {
    locationId = getPrimaryLocationId();
  } catch (e) {
    ui.alert('接続エラー\n' + e.message + '\n\n［接続設定］を確認してください。');
    return;
  }

  const statusCol = ensureStatusColumn(sheet, parsed.headerCount);
  let ok = 0; let ng = 0;

  for (const g of groups) {
    try {
      const existing = findProductByHandle(g.handle); // {id, mediaCount} or null
      const input = buildProductSetInput(g, locationId, existing ? existing.id : null);
      const data = shopifyGraphql(PRODUCT_SET, { input: input, synchronous: true });
      const errs = data.productSet.userErrors;
      if (errs && errs.length) {
        writeStatus(sheet, g.rowIndex, statusCol, '✗ ' + errs.map((e) => (e.field || '') + ' ' + e.message).join(' / '));
        ng++;
        continue;
      }
      const product = data.productSet.product;
      // 画像は「新規作成（既存に画像なし）」のときだけ付ける（再同期での重複防止）
      if (g.product.image && (!existing || existing.mediaCount === 0)) {
        attachMedia(product.id, g.product.image, g.product.imageAlt);
      }
      writeStatus(sheet, g.rowIndex, statusCol,
        (existing ? '✓ 更新 ' : '✓ 新規 ') + new Date().toLocaleString('ja-JP'));
      ok++;
    } catch (e) {
      writeStatus(sheet, g.rowIndex, statusCol, '✗ ' + e.message);
      ng++;
    }
  }
  ui.alert('同期完了\n成功: ' + ok + ' / 失敗: ' + ng + '\n（各行の「同期結果」列を確認）');
}

// ── GraphQL ───────────────────────────────────────────────

const PRODUCT_SET = [
  'mutation ProductSet($input: ProductSetInput!, $synchronous: Boolean!) {',
  '  productSet(input: $input, synchronous: $synchronous) {',
  '    product { id handle }',
  '    userErrors { field message }',
  '  }',
  '}',
].join('\n');

/** Admin GraphQL を叩く共通関数。エラーは分かりやすい例外に変換。 */
function shopifyGraphql(query, variables) {
  const props = PropertiesService.getScriptProperties();
  const domain = props.getProperty(PROP_DOMAIN);
  const token = props.getProperty(PROP_TOKEN);
  if (!domain || !token) {
    throw new Error('接続設定が未完了です。メニュー［Shopify］→［接続設定］を先に実行してください。');
  }
  const url = 'https://' + domain + '/admin/api/' + API_VERSION + '/graphql.json';
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Shopify-Access-Token': token },
    payload: JSON.stringify({ query: query, variables: variables }),
    muteHttpExceptions: true,
  });
  const code = resp.getResponseCode();
  const text = resp.getContentText() || '{}';
  if (code === 401 || code === 403) {
    throw new Error('認証エラー (' + code + ')。トークンまたはスコープ(write_products)を確認してください。');
  }
  if (code >= 400) throw new Error('API エラー (' + code + '): ' + text.slice(0, 300));
  const body = JSON.parse(text);
  if (body.errors) throw new Error('GraphQL エラー: ' + JSON.stringify(body.errors).slice(0, 400));
  return body.data;
}

/** 在庫を書き込む先（先頭の有効ロケーション）の GID。 */
function getPrimaryLocationId() {
  const data = shopifyGraphql('{ locations(first: 1) { edges { node { id } } } }', {});
  const edges = data.locations.edges;
  return edges.length ? edges[0].node.id : '';
}

/** handle で既存商品を検索。{id, mediaCount} か null。 */
function findProductByHandle(handle) {
  const q = 'query($q: String!) { products(first: 1, query: $q) { edges { node { id media(first: 1) { edges { node { id } } } } } } }';
  const data = shopifyGraphql(q, { q: 'handle:' + handle });
  const edges = data.products.edges;
  if (!edges.length) return null;
  const node = edges[0].node;
  return { id: node.id, mediaCount: node.media.edges.length };
}

/** 商品に画像を 1 枚追加（新規作成時のみ呼ぶ想定）。 */
function attachMedia(productId, url, alt) {
  const m = [
    'mutation($productId: ID!, $media: [CreateMediaInput!]!) {',
    '  productCreateMedia(productId: $productId, media: $media) {',
    '    media { ... on MediaImage { id } }',
    '    mediaUserErrors { field message }',
    '  }',
    '}',
  ].join('\n');
  shopifyGraphql(m, {
    productId: productId,
    media: [{ originalSource: url, alt: alt || '', mediaContentType: 'IMAGE' }],
  });
}

/** グループ → ProductSetInput。 */
function buildProductSetInput(g, locationId, existingId) {
  const p = g.product;
  const vis = visibility(p.visibility);
  const hasOptions = g.variants.some((v) => v.option !== '');
  const tags = normalizeTags(p.tags);

  const input = {
    title: p.title,
    handle: g.handle,
    descriptionHtml: toHtml(p.description),
    status: vis.status.toUpperCase(), // ACTIVE / DRAFT
    tags: tags ? tags.split(',') : [],
  };
  if (existingId) input.id = existingId;
  if (p.vendor) input.vendor = p.vendor;
  if (p.type) input.productType = p.type;
  if (p.seoTitle || p.seoDescription) {
    input.seo = { title: p.seoTitle || null, description: p.seoDescription || null };
  }
  // Product category は CSV と違い分類のタクソノミー GID が必要なため、ここでは送らない。
  // （カテゴリーは管理画面 or CSV で。SKU の置き場含めスキーマは Dev MCP で確認可）

  if (hasOptions) {
    input.productOptions = [{
      name: OPTION_NAME,
      values: g.variants.map((v) => ({ name: v.option || 'デフォルト' })),
    }];
  }

  input.variants = g.variants.map((v) => {
    const variant = {
      price: num(v.price),
      taxable: true,
      inventoryPolicy: 'DENY',
      inventoryItem: {
        tracked: true,
        requiresShipping: true,
        measurement: { weight: { value: Number(num(v.grams)) || 0, unit: 'GRAMS' } },
      },
    };
    if (v.sku) variant.inventoryItem.sku = v.sku; // 2025-01 では SKU は inventoryItem 配下
    if (hasOptions) variant.optionValues = [{ optionName: OPTION_NAME, name: v.option || 'デフォルト' }];
    if (locationId && num(v.qty) !== '') {
      variant.inventoryQuantities = [{ locationId: locationId, name: 'available', quantity: Number(num(v.qty)) }];
    }
    return variant;
  });
  return input;
}

// ── 入力テーブルの読み取り（同期・CSV 共通）────────────────

/**
 * アクティブシートを商品グループの配列に変換。
 * @return {{groups: Array, headerCount: number}}
 */
function readProducts(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('データ行がありません。1 行目は見出し、2 行目以降に商品を入れてください。');

  const headerRow = values[0].map((h) => String(h).trim());
  const col = {};
  headerRow.forEach((h, i) => { if (FRIENDLY_HEADERS[h]) col[FRIENDLY_HEADERS[h]] = i; });
  if (col.title === undefined || col.option === undefined || col.price === undefined) {
    throw new Error('見出しに「商品名」「サイズ」「価格」が見つかりません。テンプレートの見出しと一致させてください。');
  }

  // ハンドル空欄＝直前の商品の続き
  const rawGroups = [];
  let current = null; let lastHandle = '';
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (row.every((c) => String(c).trim() === '')) continue;
    let handle = col.handle !== undefined ? String(row[col.handle]).trim() : '';
    if (handle === '') handle = lastHandle;
    if (handle === '') handle = slugify(String(row[col.title]).trim());
    if (!current || handle !== lastHandle) {
      current = { handle: handle, rowIndex: r + 1, rows: [] }; // rowIndex は 1-based のシート行
      rawGroups.push(current);
      lastHandle = handle;
    }
    current.rows.push(row);
  }

  const get = (row, key) => (col[key] !== undefined ? String(row[col[key]]).trim() : '');
  const firstNonEmpty = (rows, key) => {
    if (col[key] === undefined) return '';
    for (const row of rows) { const v = String(row[col[key]]).trim(); if (v !== '') return v; }
    return '';
  };

  const groups = rawGroups.map((g) => {
    const product = {};
    PRODUCT_LEVEL.forEach((key) => { product[key] = firstNonEmpty(g.rows, key); });
    const variants = g.rows.map((row) => ({
      option: get(row, 'option'), sku: get(row, 'sku'), price: get(row, 'price'),
      qty: get(row, 'qty'), grams: get(row, 'grams'),
    }));
    return { handle: g.handle, rowIndex: g.rowIndex, product: product, variants: variants };
  });
  return { groups: groups, headerCount: headerRow.length };
}

/** 「同期結果」列を確保し、その列番号(1-based)を返す。 */
function ensureStatusColumn(sheet, headerCount) {
  const headers = sheet.getRange(1, 1, 1, headerCount).getValues()[0];
  const idx = headers.indexOf(STATUS_HEADER);
  if (idx !== -1) return idx + 1;
  const newCol = headerCount + 1;
  sheet.getRange(1, newCol).setValue(STATUS_HEADER);
  return newCol;
}

function writeStatus(sheet, rowIndex, col, message) {
  sheet.getRange(rowIndex, col).setValue(message);
}

// ── フォールバック: CSV ダウンロード ──────────────────────

function showDownloadDialog() {
  const html = HtmlService.createHtmlOutputFromFile('download').setWidth(360).setHeight(160);
  SpreadsheetApp.getUi().showModalDialog(html, 'Shopify 取込用 CSV');
}

/** 入力テーブル → Shopify 取込用 CSV 文字列（HTML 側から呼ばれる）。 */
function getShopifyCsv() {
  const parsed = readProducts(SpreadsheetApp.getActiveSheet());
  const out = [SHOPIFY_HEADERS.map(csvQuote).join(',')];
  for (const g of parsed.groups) {
    const p = g.product;
    const vis = visibility(p.visibility);
    g.variants.forEach((v, idx) => {
      const isFirst = idx === 0;
      out.push([
        isFirst ? p.title : '', g.handle, isFirst ? toHtml(p.description) : '',
        isFirst ? p.vendor : '', isFirst ? p.category : '', isFirst ? p.type : '',
        isFirst ? normalizeTags(p.tags) : '', isFirst ? vis.published : '', isFirst ? vis.status : '',
        v.sku, isFirst ? OPTION_NAME : '', v.option, num(v.price), 'TRUE', 'shopify',
        num(v.qty), 'DENY', num(v.grams), 'g', 'TRUE', 'manual',
        isFirst ? p.image : '', isFirst && p.image ? '1' : '', isFirst ? p.imageAlt : '',
        isFirst ? p.seoTitle : '', isFirst ? p.seoDescription : '',
      ].map(csvQuote).join(','));
    });
  }
  return out.join('\n') + '\n';
}

// ── 共通ヘルパー ──────────────────────────────────────────

function csvQuote(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toHtml(text) {
  const t = String(text || '').trim();
  if (t === '') return '';
  return t.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean).map((p) => '<p>' + p + '</p>').join('');
}

function normalizeTags(tags) {
  return String(tags || '').split(/[,、，]/).map((s) => s.trim()).filter(Boolean).join(',');
}

function num(value) {
  return String(value || '').replace(/[^\d.]/g, '');
}

function visibility(value) {
  const v = String(value || '').trim();
  if (v === '下書き' || v === '非公開' || v.toLowerCase() === 'draft') {
    return { status: 'Draft', published: 'FALSE' };
  }
  return { status: 'Active', published: 'TRUE' };
}

function slugify(title) {
  const s = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s || 'product-' + Math.random().toString(36).slice(2, 8);
}
