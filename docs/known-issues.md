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

## 7. `shopify theme pull` がローカル変更を上書きする

### 内容

`shopify theme dev` でローカル編集中の変更が、`shopify theme pull` 実行で **live テーマ（手付かず状態）に上書きされて消える**。

### 理由

`theme dev` はローカル → 一時プレビュー環境への片方向同期で、live テーマには書き込まない。一方 `theme pull` は **live → ローカルの強制上書き**。ローカルでしか変更していない場合、live は古い状態のままなので、pull で全部消える。

### 実例

Phase 3a/3b 作業中、`templates/product.json` をローカルで編集（icon-trust / collapsible_tab × 5 を追加）。`theme dev` で localhost:9292 に反映済み、しかし `theme push` していない状態で `theme pull` を実行 → live の Rise オリジナル状態でローカルが上書きされて変更が全消失。

### 対応

| 状況 | コマンド |
|---|---|
| ローカル変更を live に固定したい | `shopify theme push` |
| 別端末や admin で編集された live を取り込みたい | `shopify theme pull` （ローカル変更がない or commit 済みであることを確認） |
| 普段の開発 | `shopify theme dev` のみで十分。`pull` / `push` は意識的に判断 |

### 予防

- `theme pull` 前に **`git status` で未 commit 変更がないか確認**
- 不安なら `git stash` してから pull
- live を Theme Editor で誰かが編集したか怪しい時のみ `pull`

---

## 8. Shopify CLI トークンの期限切れ／dev サーバー再起動

### 内容

以下のいずれかで `http://127.0.0.1:9292/` にアクセスできなくなる:

1. **PC 再起動・ターミナルを閉じた**: dev サーバープロセスが停止しているだけ。再起動コマンドで戻る。
2. **長時間放置（数日〜）後**: `shopify theme dev` 起動時 or 起動中に「The access token provided is expired, revoked, malformed, or invalid for other reasons.」エラー。CLI トークン期限切れ。

### 対処

**ケース 1（単純停止）**: 再起動するだけ。

```bash
shopify theme dev --store sweet-atelier-demo.myshopify.com
```

**ケース 2（トークン期限切れ）**: ログアウト → 再認証。

```bash
shopify auth logout
shopify theme dev --store sweet-atelier-demo.myshopify.com
```

ブラウザで再認証フロー → 復旧。

> README の [Daily Workflow / 再開手順](../README.md#daily-workflow--再開手順) でも同じ手順をユーザー視点で案内している。

---

## 9. Lighthouse の color-contrast 偽陽性（reveal-on-scroll セクション）

### 内容

`npm run lighthouse:capture` の Accessibility 監査で、フッターのニュースレター見出し（`.footer-block__heading`）とメール入力欄（`#NewsletterForm--...`）が `color-contrast` 違反（contrast ratio **1.01:1**、`#f3e6e3` on `#f5e8e5`）として報告される。実際のブラウザでは普通に読める。

### 理由

テーマ設定 `animations_reveal_on_scroll: true` により、`.footer-block--newsletter` に `scroll-trigger animate--slide-in` クラスが付く。`assets/base.css` 内の以下のルールで、ビューポート外（= スクロールして表示される前）の要素は **`opacity: 0.01`** で待機する:

```css
@media (prefers-reduced-motion: no-preference) {
  .scroll-trigger.animate--fade-in,
  .scroll-trigger.animate--slide-in {
    opacity: 0.01;
  }
}
```

Lighthouse / axe-core はページ最下部のフッターをスクロールイン前の状態（`opacity: 0.01`）でスナップショットするため、文字色 `#3d2b1f` が 1% 不透明 → 背景 `#f5e8e5` とほぼ同色 = コントラスト 1:1 と誤検知する。スクロールすると `scroll-trigger--offscreen` が外れて `opacity: 1` になり、実ユーザーには正常に見える。

これは Dawn / Rise 系テーマ + 自動 a11y ツールでよく知られた既知の偽陽性パターン。

### 対応するなら（任意）

- 何もしなくてよい（実害なし。本ドキュメントに記録するのみが推奨）
- どうしても監査スコアを上げたいなら、`sections/footer-group.json` の `footer-block--newsletter` から scroll-trigger を外す（Rise の `footer.liquid:163` 改造）か、テーマ全体の `animations_reveal_on_scroll` を `false` にする。ただし演出を捨てる判断になる
- **PDP の本物の color-contrast 違反**（`.price__tax-suffix` / `.gift-options__optional` / `.delivery-date__optional` / `.delivery-date__note` の `rgba(var(--color-foreground), 0.6〜0.65)`）は Phase 4 で `0.8` に引き上げ済み。reveal-on-scroll 偽陽性とは別件。

---

## 10. Lighthouse の Best Practices が頭打ち（73 / PDP は 54）

### 内容

`npm run lighthouse:capture` の Best Practices スコアが全ページ **73**、商品ページ（PDP）だけ **54** で止まる。Phase 4 でアクセシビリティ・SEO は 100 近くまで上げたが、Best Practices だけは改善できなかった。

### 理由（audit 内訳）

| audit | 減点 | 原因 | テーマで直せるか |
|---|---:|---|---|
| `third-party-cookies` | −5（PDP のみ） | Shop Pay の `_shop_app_essential` cookie（`shop.app/pay/hop`） | ✗ Shopify の決済プラットフォーム仕様。admin で Shop Pay 高速チェックアウトを無効化すれば消えるが非推奨 |
| `errors-in-console` | −1 | `shop.app` iframe が CSP `frame-ancestors` に違反してブロックされるエラー | ✗ Shopify 側 |
| `inspector-issues` | −1 | 上記 cookie / CSP が Chrome DevTools Issues に記録される | ✗ Shopify 側 |
| `deprecations` | −5（PDP のみ） | 「`overflow: visible` を img/video/canvas に指定すると要素境界外に描画されうる」（[WICG view-transitions の将来仕様](https://github.com/WICG/shared-element-transitions/blob/main/debugging_overflow_on_images.md)）。Chrome のソース帰属は `assets/global.js` を指すが、実体は Dawn/Rise 共通の CSS パターン由来。Shopify 自身も未対応のまま | △ 原因 CSS の特定が困難・実害なし。学習デモでは追わない |

PDP 以外（ホーム / 補助ページ）は Shop Pay スクリプトを読まないので `third-party-cookies` と PDP 限定の `deprecations` が外れ、その分 73。

なお `theme dev` は http なので本番（https + 独自ドメイン）では一部 audit の挙動が変わる。**本番デプロイ後に再計測すれば PDP 以外は 80 台後半まで上がる見込み**（PDP は Shop Pay cookie が残るため低いまま）。

### 対応するなら

- 何もしなくてよい（学習デモの範囲外。本ドキュメントに記録するのみが推奨）
- どうしても PDP の Best Practices を上げたいなら admin で「Shop Pay」高速チェックアウトボタンを無効化（`third-party-cookies` / `errors-in-console` / `inspector-issues` が消える）。ただしコンバージョン率に効くボタンを捨てる判断になる
- `deprecations` の `overflow: visible` は `assets/base.css` の `.global-media-settings { overflow: visible !important; }` 等が候補だが、特定しても 5 点・実害なしのため優先度は最低

---

## 更新ルール

- 新しい既知問題が見つかったら**末尾**に追加（番号は連番）
- **解消した問題は削除**（git history で復元可能）
- 各項目に `内容 / 理由 / 対応するなら` を必ず書く
- Phase 完了時に「この Phase で発見した既知問題」を集約してここに追記
