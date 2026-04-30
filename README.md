# shopify-cake-store-demo-theme

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

- **ファイル名**: kebab-case（例: `hero-banner.liquid`, `product-card.liquid`）
- **CSS クラス**: BEM ライク（例: `.product-card__title`, `.hero-banner--fullwidth`）
- **JavaScript**: モジュール単位で `assets/` に配置
- **Liquid 変数**: snake_case（例: `product_title`, `featured_collection`）

## Cross-Platform Notes

- 開発環境: Windows（Bash / PowerShell）と macOS の双方で開発可能
- 行末コード: `.gitattributes` により LF に統一
- `shopify.theme.toml` は環境ごとに異なるため `.gitignore` 対象（ストアURL・テーマIDが含まれる）
- Shopify CLI と認証は環境ごとに別途必要

## Roadmap

- [x] **Phase 0** — 環境構築 / Rise theme baseline
- [ ] **Phase 1** — ストア設定・ダミーコンテンツ（ブランド設定、ダミー商品、コレクション）
- [ ] **Phase 2** — トップページカスタマイズ（ヒーロー、おすすめ商品、用途別導線）
- [ ] **Phase 3** — 商品カード・商品詳細ページ・カートUX（配送日選択など）
- [ ] **Phase 4** — レスポンシブ調整・ドキュメント整備・公開準備

## Credits

このテーマは Shopify 公式の **[Rise theme](https://themes.shopify.com/themes/rise)** をベースとして派生したものです。元テーマの著作権・ライセンスは Shopify Inc. に帰属します。本リポジトリで公開しているカスタマイズ部分は学習用の派生物であり、Rise theme の利用規約に従って使用してください。

## License

[MIT](LICENSE) — 本リポジトリでカスタマイズした部分のみを対象とします。
