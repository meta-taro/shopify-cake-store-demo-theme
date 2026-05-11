# shopify-cake-store-demo-theme

[![Shopify](https://img.shields.io/badge/Shopify-Online_Store_2.0-95BF47?logo=shopify&logoColor=white)](https://shopify.dev/docs/themes)
[![Theme Base](https://img.shields.io/badge/Base-Rise-7AB55C?logo=shopify&logoColor=white)](https://themes.shopify.com/themes/rise)
[![Liquid](https://img.shields.io/badge/Liquid-template-2196F3?logo=shopify&logoColor=white)](https://shopify.dev/docs/api/liquid)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Shopify CLI](https://img.shields.io/badge/Shopify_CLI-3.x-5E8E3E?logo=shopify&logoColor=white)](https://shopify.dev/docs/themes/tools/cli)
[![Status](https://img.shields.io/badge/status-WIP-orange.svg)](#roadmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Shopify Online Store 2.0 のテーマ開発を学ぶためのデモプロジェクト。架空のケーキ・スイーツEC「**Sweet Atelier**」向けに、Shopify 公式テーマ **Rise** をベースとしてカスタマイズしていく学習用テーマです。

> 実在のサイト・ブランド・商品名・画像・文章は使用していません。すべてオリジナルのデモコンテンツで構築します。

## Tech Stack

- Shopify Online Store 2.0
- Liquid
- JSON templates
- Sections / Snippets
- CSS（Sass は任意）
- JavaScript（Vanilla, ES6+）
- Shopify CLI 3.x
- Node.js 22 LTS

## Prerequisites

- [Node.js 22+](https://nodejs.org/)（`.nvmrc` でバージョン固定済み）
- npm 10+
- [Shopify CLI 3.x](https://shopify.dev/docs/themes/tools/cli)
- [Shopify Partners](https://www.shopify.com/jp/partners) アカウント＋開発ストア

## Setup

### 1. クローン

```bash
git clone https://github.com/meta-taro/shopify-cake-store-demo-theme.git
cd shopify-cake-store-demo-theme
```

### 2. Node.js バージョンを適用

```bash
fnm use      # fnm 利用者
# または
nvm use      # nvm 利用者
```

### 3. Shopify CLI をインストール

```bash
npm install -g @shopify/cli@latest
shopify version    # 3.x が表示されればOK
```

### 4. 開発ストアと接続

`{YOUR_STORE}` をご自身の開発ストア URL（例: `xxxxx.myshopify.com`）に置き換えて実行します。

```bash
shopify theme dev --store {YOUR_STORE}.myshopify.com
```

初回はブラウザが開いて Shopify の認証フローが走ります。完了後、`http://127.0.0.1:9292` でローカルプレビューできます。ファイル保存で自動リロードされます。

## Commands

| コマンド | 用途 |
|---|---|
| `shopify theme dev --store {STORE}.myshopify.com` | ローカル開発サーバー起動（HMR付き） |
| `shopify theme push` | ローカル → ストアへ反映 |
| `shopify theme pull` | ストア → ローカルへ取得 |
| `shopify theme list` | ストアにあるテーマ一覧 |
| `shopify theme check` | テーマのリンター実行 |
| `npm run screenshot:baseline` | ローカル dev サーバーから Phase 比較用スクリーンショット取得（[詳細](./docs/screenshots/README.md)） |

## Directory Structure

```
.
├── assets/          # CSS, JS, SVG, 画像, フォント
├── config/          # settings_schema.json, settings_data.json
├── layout/          # theme.liquid, password.liquid
├── locales/         # 翻訳 JSON（ja.json, en.default.json 等）
├── sections/        # セクション Liquid
├── snippets/        # スニペット Liquid
└── templates/       # JSON テンプレート（および .liquid オーバーライド）
```

## Conventions

ファイル命名は Rise / Dawn の慣習を踏襲します。すべて **kebab-case**。

### `sections/`

| プレフィックス | 用途 | 例 |
|---|---|---|
| `main-*` | テンプレートのメイン領域専用セクション | `main-product`, `main-cart-items`, `main-collection-product-grid` |
| `featured-*` | ホーム等の訴求枠 | `featured-collection`, `featured-product`, `featured-blog` |
| `cart-*` | カート関連 | `cart-drawer`, `cart-notification-product` |
| (機能名) | 汎用セクション | `image-banner`, `multicolumn`, `slideshow`, `header`, `footer` |

### `snippets/`

| プレフィックス | 用途 | 例 |
|---|---|---|
| `card-*` | カード型UI部品 | `card-product`, `card-collection`, `article-card` |
| `icon-*` | アイコン | `icon-accordion` |
| `header-*` | ヘッダー部品 | `header-mega-menu`, `header-search`, `header-drawer` |
| `product-*` | 商品関連 | `product-media`, `product-variant-picker`, `product-thumbnail` |
| (機能名) | 汎用スニペット | `pagination`, `price`, `meta-tags` |

### `assets/`

| プレフィックス | 用途 |
|---|---|
| `component-*.css` | 再利用 CSS コンポーネント（例: `component-card.css`, `component-cart-drawer.css`） |
| `section-*.css` | セクション固有 CSS（例: `section-main-product.css`） |
| `template-*.css` | テンプレート固有 CSS（例: `template-collection.css`） |
| `icon-*.svg` | アイコン SVG |
| (機能名).js | JavaScript モジュール（例: `cart.js`, `product-form.js`） |

### コード規約

- **CSS クラス**: BEM ライク（`.product-card__title`, `.hero-banner--fullwidth`）
- **JavaScript**: モジュール単位で `assets/` に配置、Vanilla JS (ES6+)
- **Liquid 変数**: snake_case（`product_title`, `featured_collection`）
- **新規セクション/スニペット作成時**: 上記プレフィックス慣習に従う。判断に迷う場合は機能ベース命名でOK

## Cross-Platform Notes

- 開発環境: Windows（Bash / PowerShell）と macOS の双方で開発可能
- 行末コード: `.gitattributes` により LF に統一
- `shopify.theme.toml` は環境ごとに異なるため `.gitignore` 対象（ストアURL・テーマIDが含まれる）
- Shopify CLI と認証は環境ごとに別途必要

## Roadmap

- [x] **Phase 0** — 環境構築 / Rise theme baseline（2026-05-01 完了）
- [x] **Phase 1** — ストア設定・ダミーコンテンツ（ブランド設定 / 商品 5 件 / コレクション 5 件 / 日本語化）（2026-05-03 完了）
- [x] **Phase 2** — トップページカスタマイズ（ヒーロー / 定番のケーキ / コレクションリスト / キャンペーン / ブランド紹介 / レビュークーポン）（2026-05-07 完了）
- [x] **Phase 3** — 商品詳細・カートUX・補助ページ（2026-05-11 完了）
  - [x] 3a PDP 基本拡張（タブ × 5 / 信頼バッジ / 関連商品）
  - [x] 3b バリアント・サイズ選択 UI
  - [x] 3c ギフトオプション（熨斗 / メッセージカード / ラッピング、line item properties）
  - [x] 3d お届け日ピッカー（最短 3 営業日後 / 水曜定休除外 / 時間帯選択）
  - [x] 3e 商品カード強化（タグベースバッジ "新商品 / 季節限定 / 人気" + 税込表記）
  - [x] 3f 補助ページ（お届けについて / FAQ / 特定商取引法 / 店舗情報 — 4 テンプレート + admin 手順書）
  - [ ] 3g アレルゲン構造化データ（任意・スキップ）
- [ ] **Phase 4** — レスポンシブ調整・Lighthouse 計測・ドキュメント整備・公開準備

各フェーズのスクリーンショット差分は [`docs/screenshots/`](./docs/screenshots/) で `baseline → phase-1 → phase-2 → phase-3` の順に確認できます。

## Credits

このテーマは Shopify 公式の **[Rise theme](https://themes.shopify.com/themes/rise)** をベースとして派生したものです。元テーマの著作権・ライセンスは Shopify Inc. に帰属します。本リポジトリで公開しているカスタマイズ部分は学習用の派生物であり、Rise theme の利用規約に従って使用してください。

### Baseline 情報

| 項目 | 値 |
|---|---|
| Theme name | Rise |
| Theme version | **15.4.1** |
| Author | Shopify |
| Pull date | 2026-04-30 |
| Baseline commit | [`b10336b`](https://github.com/meta-taro/shopify-cake-store-demo-theme/commit/b10336b) |
| Source | 開発ストアにプリインストールされていた live theme を `shopify theme pull` で取得 |

> Rise 本体が更新された場合は、新規ブランチで `shopify theme pull --new-store` 後、`b10336b` との diff を取って手動マージ判断する想定。

baseline 時点での `shopify theme check` 結果（自分のカスタマイズと Rise 由来の offense を切り分けるための基準値）は [`docs/theme-check-baseline.md`](./docs/theme-check-baseline.md) に記録。公開前の手動QAチェックリストは [`docs/qa-checklist.md`](./docs/qa-checklist.md)（Phase 完了ごとに育てる Living checklist）。意図的に対応していない既知問題と Rise ベースライン由来の制約は [`docs/known-issues.md`](./docs/known-issues.md) に集約。

## License

[MIT](LICENSE) — 本リポジトリでカスタマイズした部分のみを対象とします。
