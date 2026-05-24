# スプレッドシートでの商品一括登録（CSV import/export 実務メモ）

> Phase 16。Shopify 標準の商品 CSV を使った **export → スプレッドシートで編集 → re-import** の
> 往復を実務目線で整理する。テーマのコードには手を入れない（ストア運用の知識編）。
>
> サンプル CSV は [`docs/samples/products-sample.csv`](./samples/products-sample.csv)（本リポの 5 商品分）。
> 各商品の正本データは [`docs/seed-data/products.md`](./seed-data/products.md)。

## 1. なぜ CSV 一括登録か

- 商品が増えると管理画面の 1 件ずつ入力は非効率。**価格改定・在庫調整・タグ付け直し**などは
  スプレッドシートで一括編集 → import が圧倒的に速い。
- 「export して中身を見る」だけでも、Shopify が商品をどう構造化しているか（バリアント・画像・
  メタフィールド）が一望できる。**まず自分のストアを export してみるのが学習の最短路**。

## 2. 往復の手順（16a）

```
1. 管理画面 → 商品管理 → 右上「エクスポート」
     → 「すべての商品」/「現在のページ」など範囲を選択
     → CSV（Excel・各種スプレッドシート用）でダウンロード
2. Google Sheets で開く（後述のエンコーディング注意）
     ファイル → インポート → アップロード → 区切り文字「カンマ」
3. 編集（価格・在庫・タグ・SEO 等）。列の追加・削除・並べ替えはしない方が安全
4. ファイル → ダウンロード → カンマ区切り形式（.csv / UTF-8）
5. 管理画面 → 商品管理 → 「インポート」→ ファイル選択
     → 「同じ handle の既存商品を上書きする」を必要に応じて ON
     → プレビューで件数を確認してから実行
6. import 後、件数・バリアント・画像・在庫を必ず目視確認
```

> **上書きの鍵は `URL handle`（旧 `Handle`）**。これが既存商品と一致した行は更新、
> 一致しなければ新規作成。handle を変えると「別商品の新規作成」になり重複するので注意。

## 3. 列の構成（2026-05 時点の標準テンプレート）

Shopify は CSV のヘッダー名を**人が読める表示名**に刷新済み。現在の標準テンプレートの
ヘッダー行（先頭 40 列ほど・抜粋）:

```
Title, URL handle, Description, Vendor, Product category, Type, Tags,
Published on online store, Status, SKU, Barcode,
Option1 name, Option1 value, Option1 Linked To, Option2 name, Option2 value, ...,
Price, Compare-at price, Cost per item, Charge tax, Tax code,
Inventory tracker, Inventory quantity, Continue selling when out of stock,
Weight value (grams), Weight unit for display, Requires shipping, Fulfillment service,
Product image URL, Image position, Image alt text, Variant image URL,
Gift card, SEO title, SEO description,
Google Shopping / ... , <metafield columns>
```

### 旧ヘッダー ↔ 新ヘッダー対応（最大の落とし穴）

ネット上の記事・既存スクリプト・古い CSV テンプレートは**旧ヘッダー名**を使っているものが
多い。**import は旧名でも受け付ける**が、export で出てくるのは新名なので混在に注意。

| 旧（内部名・〜2024 頃まで広く流通） | 新（現行 export の表示名） |
|---|---|
| `Handle` | `URL handle` |
| `Body (HTML)` | `Description` |
| `Published` | `Published on online store` |
| `Variant SKU` | `SKU` |
| `Variant Price` | `Price` |
| `Variant Compare At Price` | `Compare-at price` |
| `Variant Grams` | `Weight value (grams)` |
| `Variant Inventory Qty` | `Inventory quantity` |
| `Variant Inventory Policy`（deny/continue） | `Continue selling when out of stock`（DENY/CONTINUE） |
| `Variant Requires Shipping` | `Requires shipping` |
| `Variant Taxable` | `Charge tax` |
| `Image Src` | `Product image URL` |
| `Image Alt Text` | `Image alt text` |
| `Variant Image` | `Variant image URL` |

> `Body (HTML)`／`Description` には **HTML を入れられる**（rich text の段落は `<p>…</p>`）。
> 「プレーンテキストのみ」という解説は誤り。サンプル CSV も `<p>` 段落で入れている。

## 4. バリアントの表現（複数行 = 1 商品）

1 商品に複数バリアント（サイズ等）があると、**行が分かれて同じ `URL handle` を繰り返す**。

- **1 行目**: 商品レベルの全項目（Title・Description・Tags・画像・SEO 等）＋ 1 個目のバリアント
- **2 行目以降**: `URL handle` と**バリアント固有の列だけ**埋め、商品レベルの列は空欄。
  `Option1 name` も空欄でよい（`Option1 value` のみ各行に入れる）

サンプル CSV の例（苺のショートケーキ = 3 サイズ）:

| URL handle | Title | Option1 name | Option1 value | SKU | Price |
|---|---|---|---|---|---|
| strawberry-shortcake | 苺のショートケーキ | サイズ | 4号… | SC-4 | 3800 |
| strawberry-shortcake | （空） | （空） | 5号… | SC-5 | 4800 |
| strawberry-shortcake | （空） | （空） | 6号… | SC-6 | 6200 |

**画像を 2 枚以上**付ける場合も同じ要領で、`URL handle` ＋ `Product image URL` ＋
`Image position` だけの行を追加する（1 画像 = 1 行）。

## 5. つまずきポイントと回避策（16b）

### 5.1 エンコーディング（最頻出）
- Shopify の CSV は **UTF-8 / LF 改行**。日本語商品名はここを外すと文字化けする。
- **Excel で直接開くと SJIS 解釈で文字化け**しやすい。**Google Sheets で「インポート」**するか、
  Excel なら「データ → テキスト/CSV から → 65001:UTF-8」を明示。ダブルクリックで開かない。
- 保存時も UTF-8 を維持（Google Sheets のダウンロードは UTF-8 固定で安全）。
- BOM 付き UTF-8 でも import は通るが、付けない方が無難。

### 5.2 カンマ・引用符のクォート
- 値に **半角カンマ `,`** が含まれる列は必ず `"…"` で囲む。
  例: `Product category` の `"Food, Beverages & Tobacco > Food Items > Bakery"`、
  複数値の `Tags`（`"定番,ショートケーキ,苺,通年"`）。
- 全角読点 `、` は区切り文字ではないのでクォート不要（が、囲んでも害はない）。
- 値に `"` を含めるときは `""`（2 個）でエスケープ。
- スプレッドシートのセルに入れる分にはツールが自動でクォートするが、**手書き CSV／スクリプト
  生成では自分でクォート**する必要がある。

### 5.3 画像は「公開 URL」が必須
- `Product image URL` は **公開到達可能な URL**。ローカルパスや管理画面内の URL は不可。
- 本リポのサンプルは公開リポの raw URL を使用（例:
  `https://raw.githubusercontent.com/.../docs/seed-data/products/01-strawberry-shortcake.png`）。
- 同じ画像 URL を複数商品で使い回すと、Shopify 側で**重複アップロード**になり得る。商品ごとに
  実体の異なる URL を割り当てる。import 直後は画像取得が**非同期**で、反映に時間差が出ることがある。

### 5.4 在庫は「単一ロケーション」前提
- `Inventory quantity` は CSV では**1 ロケーション分**しか持てない。複数拠点の在庫は CSV では
  正確に表現できず、import で意図せず**他ロケーションが 0 になる**事故がある。多拠点は管理画面か
  在庫用 CSV（在庫専用エクスポート）で扱う。
- `Inventory tracker` を `shopify` にしないと数量が追跡されない。

### 5.5 価格・税の表記
- `Price` / `Compare-at price` は**数値のみ**（`¥` やカンマ区切り `3,800` は不可。`3800`）。
- 税込/税別は**ストアの税設定**に従う（CSV の数値は設定された税ルールで解釈）。本デモは税込運用なので
  CSV の価格＝税込表示額。`Charge tax` は `TRUE`。

### 5.6 `Status` と公開状態は別物
- `Status`: `Active` / `Draft` / `Archived`。
- `Published on online store`: `TRUE` / `FALSE`（オンラインストア販売チャネルでの公開可否）。
- 両方そろって初めて店頭に出る。**`Draft` のまま import → 「商品が表示されない」**は定番の事故。

### 5.7 コレクションは商品 CSV に入らない
- 標準の商品 CSV に**コレクション割当の列はない**（手動コレクションは別管理、自動コレクションは
  タグ等の条件で付く）。CSV 後に管理画面でコレクションを確認する。本デモは
  `signature / seasonal / gifts / baked-goods / anniversary` をタグまたは手動で割当。

### 5.8 メタフィールド列はストアごとに異なる
- export には**そのストアで定義済みのメタフィールド列**が
  `名前 (product.metafields.namespace.key)` 形式で並ぶ。本デモはアレルゲン情報（標準カテゴリー
  メタフィールド）・季節販売期間（`custom.sale_start/sale_end`）等が出る想定。
- サンプル CSV は移植性のためメタフィールド列を**省いている**。実ストアの export はこれらを含むので、
  アレルゲンや販売期間も CSV で一括編集できる（列名は export で確認）。
- `Product category`（Shopify タクソノミー）が**カテゴリーメタフィールド（アレルゲン情報欄など）の
  出現を左右する**。タクソノミーのパス文字列は厳密なので、迷ったら管理画面で正しいノードを選ぶ。

### 5.9 import 中断・部分失敗
- 行数が多いと import は**非同期**でメール通知。途中でエラー行があると**その行だけスキップ**して
  続行することがある（全件ロールバックではない）。完了メールとエラーレポートで弾かれた行を確認。
- 大量更新の前に**必ず現状を export してバックアップ**を取る（やり直しの保険）。

## 6. 動作確認チェックリスト（import 後）

- [ ] 商品件数・バリアント数が想定どおり
- [ ] 日本語（商品名・説明）が文字化けしていない
- [ ] 価格・在庫・SKU が各サイズで正しい
- [ ] 画像が全商品に付き、ALT も入っている
- [ ] `Status=Active` かつ オンラインストアで公開
- [ ] コレクション割当（タグ／手動）を確認
- [ ] アレルゲン等メタフィールドが意図どおり（実ストア export 時）
- [ ] `/products/<handle>` で PDP が正しく表示（テーマ側の機能と整合）

## 7. CSV 往復を自動化する（16d / Google Apps Script で直接同期）

CSV のダウンロード → 管理画面のインポートという手作業は、件数が増えると地味に重い
（毎回ファイルを取り回す・どれを取り込んだか分からなくなる・上書き有無の取り違え）。
**スプレッドシートのボタン 1 つで Shopify に同期**できるようにすると、店舗運用者の認知負荷が
ぐっと下がる。Phase 16d は Google Apps Script (GAS) からそれを実装するレシピ。

実装一式: [`docs/samples/google-sheets/`](./samples/google-sheets/) （`Code.gs` / `download.html`）。

### 7.1 仕組み（CSV import との対比）

| | CSV 往復（16a） | Apps Script 同期（16d） |
|---|---|---|
| API | なし（管理画面の import） | Shopify Admin **GraphQL** `productSet` |
| 上書きキー | `URL handle` | `handle`（findProductByHandle → 既存 ID を input.id に詰めて upsert） |
| 操作 | ファイル DL → アップロード | シートのメニューから［ストアに同期］ |
| 認証 | 管理画面ログイン | カスタムアプリの **Admin API トークン**（`shpat_…`） |
| 在庫 | 単一ロケーション分のみ | 同上（`inventoryQuantities` で先頭ロケーションに書く） |
| 画像 | 列で複数行に分けて指定 | 新規作成時のみ `productCreateMedia` で 1 枚添付（再同期での重複防止） |
| 結果のフィードバック | import 完了メール | 行ごとに「同期結果」列へ `✓ 新規 / ✓ 更新 / ✗ ...` を即時記録 |
| 失敗時 | エラーレポート CSV | userErrors を行単位で表示。フォールバックで CSV DL も残す |

CSV import の知識（16a〜c）はそのまま下敷きになる。GraphQL に乗り換えても**handle が上書きの鍵**、
**バリアントは行で複製**、**在庫は単一ロケーション前提**といった商品データモデルは同じ。

### 7.2 セットアップ手順

1. **Shopify 管理画面** → 設定 → アプリと販売チャネル → アプリ開発 → カスタムアプリを作成
   （初回はストアレベルで「カスタムアプリの開発を許可」が必要）
2. Admin API スコープに **`write_products`**（在庫を書くなら **`write_inventory`** も）を付与 → インストール
3. Admin API アクセストークン（`shpat_…`）をコピー。**1 度しか表示されない**ので保管に注意
4. 新しい Google スプレッドシートを作成 → 拡張機能 → Apps Script
5. `docs/samples/google-sheets/Code.gs` の内容を `コード.gs` に貼り付け
6. ファイル → ＋ → HTML を作成 → 名前 `download` → `download.html` の内容を貼り付け
7. シートに戻ってリロード → メニューに **［Shopify］** が現れる
8. ［Shopify］→ ［接続設定］でストアドメインとトークンを保存（Script Properties に保管され、シート本体・リポジトリには残らない）
9. ［接続テスト］でストア名が返ればOK
10. シート 1 行目に見出しを置く：`商品名 / ハンドル / 説明 / ベンダー / カテゴリー / 商品タイプ / タグ / サイズ / SKU / 価格 / 在庫 / 重量(g) / 画像URL / 画像ALT / SEOタイトル / SEO説明 / 公開状態`
11. 2 行目以降に商品を入力。**サイズ違いは行を分けて同じハンドルを並べる**（ハンドル列空欄でも直前行を継承）
12. ［ストアに同期］→ 確認ダイアログ → 実行。各行に `✓ 新規 / ✓ 更新` または `✗ <理由>` が記録される

### 7.3 セキュリティの勘所

- **トークンはシートに書かない**。`PropertiesService.getScriptProperties()` に保存し、
  リポジトリ・履歴にも残さない（`Code.gs` には Script Property のキー名しか登場しない）
- スコープは**必要最小**（`write_products` / `write_inventory` だけ。`read_customers` などは付けない）
- 配布する場合は **Apps Script プロジェクトを共有しない**（共有すると Script Properties も見える）。
  各運用者が自分の GAS プロジェクトを作り、自分のトークンを ［接続設定］で入力する設計
- Admin API トークンが漏れた疑いがあれば、管理画面のカスタムアプリ画面で**即ローテーション**

### 7.4 詰まりやすい点

- **API バージョン依存のフィールド差**: `productSet` の `ProductVariantSetInput` は API バージョンで
  形が変わる。例: 2024-10 以降 `sku` は `variant.sku` ではなく `variant.inventoryItem.sku` に移動。
  本サンプルは `API_VERSION = '2025-01'` を前提。上げるときは **Shopify Dev MCP の
  `introspect_admin_schema`** か GraphiQL 探索で必ず形を確認する。userErrors のメッセージが
  「同期結果」列に出るので、それで気づけるよう設計してある。
- **画像の重複アップロード**: `productSet` は media を冪等に扱わない（同じ URL を毎回作る）。
  本サンプルは「既存商品で media が 0 件のときだけ `productCreateMedia` を呼ぶ」ルールで
  2 回目以降の同期で画像が増殖しないようにしている。複数画像や差し替えが必要になったら、
  `productDeleteMedia` を組み合わせた**画像同期モード**を別途実装するのが筋。
- **Product category（タクソノミー）**: CSV と違い GraphQL では **タクソノミー GID** を渡す
  必要があり、文字列パスでは送れない。本サンプルでは送っておらず、カテゴリーは管理画面か
  CSV 側で付ける運用にしている。
- **在庫は単一ロケーション**: 先頭ロケーションに対して `inventoryQuantities` を書くだけ。
  多拠点は対象外（CSV 側と同じ制約）。
- **下書き(`Draft`)で同期した商品は店頭に出ない**: `公開状態` 列で `下書き` を入れた行は
  `status: DRAFT` で作成され、`Published on online store` は FALSE 扱い。表に出したいときは
  `公開` または空欄に。
- **タグ・カテゴリーの分割**: タグは半角カンマ／全角読点／全角カンマ 3 種で区切れるよう
  `normalizeTags()` で吸収済み。スプレッドシート上で見やすい区切りで書ける。

### 7.5 フォールバック（オフライン／API 不通時）

［取込用 CSV をダウンロード（フォールバック）］を残してある。同じ入力テーブルから
**Shopify 標準ヘッダーの CSV（UTF-8 + BOM）** を生成してブラウザでダウンロードし、
管理画面の import に流せる。**API トークンが用意できない環境のレビュー用**にも有効。

### 7.6 16d の動作確認チェックリスト

- [ ] ［接続テスト］でストア名が返る
- [ ] 初回 ［ストアに同期］で商品が**新規作成**され、「✓ 新規 …」と記録される
- [ ] 同じハンドルで再同期すると **更新**になり、画像が増殖しない（既存 media 数が 1 のまま）
- [ ] 価格・在庫・SKU の変更が反映される
- [ ] `公開状態=下書き` の行は管理画面で Draft、`Published on online store` が FALSE
- [ ] わざと不正値（`価格 = "高め"` 等）を入れた行は `✗ <理由>` が記録される
- [ ] トークン無効化後の同期で `認証エラー (401)` メッセージが「同期結果」に出る

## 参考

- Shopify Help Center「Using CSV files to import and export products」
- 標準テンプレート CSV（ヘッダー確認用の公式サンプル）: `help.shopify.com/csv/product_template.csv`
- Shopify Admin GraphQL API: `productSet` ミューテーション / `ProductSetInput` / `ProductVariantSetInput`
- Google Apps Script: `UrlFetchApp` / `PropertiesService` / `SpreadsheetApp.Ui`
