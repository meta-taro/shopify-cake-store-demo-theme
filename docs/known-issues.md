# Known Issues

このリポジトリで把握しているが**意図的に対応していない**問題と、Rise theme ベースライン由来の制約を一元化したドキュメント。

「バグかな？」と思ったらまずここを確認してください。

## 1. theme-check の baseline エラー（2 errors / 9 warnings）

### 内容

`shopify theme check` 実行時、Rise theme 由来の以下のエラーが**常に**出る。

**ValidSchemaTranslations × 2** in `sections/featured-product.liquid:743-744`
- `t:sections.main-product.blocks.icon_with_text.settings.content.label` が locale schemas にない
- `t:sections.main-product.blocks.icon_with_text.settings.content.info` が locale schemas にない

警告 9 件は `UnusedAssign` / `OrphanedSnippet` / `UndefinedObject` 等で、いずれも Rise 由来。

### なぜ放置か

`en.default.schema.json` と `ja.schema.json` だけにキーを追加したところ、`MatchingTranslations` チェックが他 18 言語（cs, da, de, es, fi, fr, it, ko, nb, nl, pl, pt-BR, pt-PT, sv, th, tr, zh-CN, zh-TW）すべてで同期を要求し、エラーが 2 → 36 に**増加**。

20 言語すべてに同じキーを追加するコストが、得られる便益（学習リポジトリで使わない他言語の整備）に見合わないため**現状維持**。

### 対応するなら

- 全 20 言語の `*.schema.json` に `icon_with_text.settings.content.label` / `.info` を追加
- もしくは `featured-product.liquid` から問題の翻訳キー参照を削除

---

## 2. ヒーローテキストの改行が手動で入れられない

### 内容

トップページのヒーロースライドで、見出し「季節のケーキ、はじめました」を改行したくても `<br>` タグが消える。

### 理由

Rise の `slideshow` セクションで heading フィールドが `inline_richtext` 型のため、Shopify 側が `<br>` を strip する仕様。

### 回避策

- `heading_size` を小さくしてビューポート幅で自然折り返し（現状の対応）
- CSS で `max-width` を狭めて折り返し位置を制御
- どうしても明示改行したいなら schema を `richtext` 型に変更（Rise 改造）

---

## 3. featured-collection の「すべて見る」ボタンが表示されない

### 内容

トップページの「定番のケーキ」セクションで「すべて見る」ボタンが見えない。

### 理由

Rise の `featured-collection.liquid:44-47` の仕様：

```liquid
if section.settings.collection.all_products_count > section.settings.products_to_show
  assign more_in_collection = true
endif
```

「全商品が既に表示されているのに『すべて見る』はおかしい」という親切設計。

現状: signature 商品数 = 2、`products_to_show` = 4 → 2 > 4 が false → ボタン非表示。

### 対応するなら

- signature コレクションに商品を追加（5 件以上にすれば自動表示される）
- もしくは `products_to_show` を 1 に下げる（ただし商品 1 個しか見えない UX 悪化）

---

## 4. image-banner の image_2 併用時に画像がクロップされる

### 内容

`image-banner` セクションで `image` と `image_2` を両方セットすると、`image_height: "adapt"` を指定しても各画像が 50%幅 × cover で**横方向にクロップ**される。3:4 縦長や焼込テキスト画像では文字が切れる。

### 理由

Rise の image-banner は単一画像時のみ `banner--adapt` クラスで natural ratio を維持。`image_2` 併用時は `banner__media-half` クラスが当たり、CSS で `object-fit: cover` がかかる。

### 回避策

**multicolumn セクションを使う**（Sweet Atelier の採用解）。column ブロックに 1 画像ずつ配置すれば各画像が独立して `image_ratio: "adapt"` で表示される。

詳細: `templates/index.json` の `campaigns` セクション参照。

---

## 5. キャンペーン画像にクリックリンクが未設定

### 内容

トップページのキャンペーン 2 画像（春キャンペーン / 2+1）とブランド紹介画像（10）はクリックしても遷移しない。

### 理由

学習用デモのため CTA リンクは未設定。本番運用なら必要。

### 対応するなら

`templates/index.json` の各 multicolumn column ブロックの `link` / `link_label` フィールドに URL を入れる。例：

```json
"campaign-spring": {
  "type": "column",
  "settings": {
    "image": "shopify://shop_images/07-campaign-spring.png",
    "link_label": "詳しく見る",
    "link": "shopify://collections/seasonal"
  }
}
```

---

## 6. CSS カスタムプロパティの透過記法

### 内容

Rise の `--color-*` 変数は `theme.liquid:63` で **コンマ区切り** (`R,G,B`) で定義されている。

### よくある罠

モダン記法 `rgb(var(--color-background) / 0.2)` は無効 CSS になる（`rgb(251,248,243 / 0.2)` はパースエラー）。ブラウザは無視してデフォルト値が当たる。

### 正しい書き方

レガシー記法 `rgba(var(--color-background), 0.2)` を使う。

詳細: `assets/component-slideshow.css` の Sweet Atelier custom overrides セクション参照。

---

## 7. Shopify CLI トークンの期限切れ

### 内容

`shopify theme dev` を長時間放置すると、ある時点から「The access token provided is expired, revoked, malformed, or invalid for other reasons.」エラーが出る。

### 対処

```bash
# サーバー停止後
shopify auth logout
shopify theme dev --store sweet-atelier-demo.myshopify.com
```

ブラウザで再認証フロー → 復旧。

---

## 更新ルール

- 新しい既知問題が見つかったら**末尾**に追加（番号は連番）
- **解消した問題は削除**（git history で復元可能）
- 各項目に `内容 / 理由 / 対応するなら` を必ず書く
- Phase 完了時に「この Phase で発見した既知問題」を集約してここに追記
