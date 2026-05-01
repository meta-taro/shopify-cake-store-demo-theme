# CLAUDE.md

## Project

Shopify Online Store 2.0 デモテーマ（ケーキ・スイーツEC向け）。学習・スキル確認用。

実在サイトの画像・ロゴ・文章・商品名は使用しない。すべてオリジナルのデモコンテンツで構築する。

## Tech Stack

- Shopify Online Store 2.0
- Liquid
- JSON templates
- Sections / Snippets
- CSS（Sass は任意）
- JavaScript（Vanilla JS, ES6+）
- Shopify CLI 3.x

## Directory Structure

```
├── assets/          # CSS, JS, 画像, フォント
├── config/          # settings_schema.json, settings_data.json
├── layout/          # theme.liquid, password.liquid
├── locales/         # 翻訳 JSON（ja.json, en.json 等）
├── sections/        # セクション Liquid ファイル
├── snippets/        # スニペット Liquid ファイル
└── templates/       # JSON テンプレート（および .liquid オーバーライド）
```

## Development Commands

```bash
# ローカル開発サーバー起動
shopify theme dev --store {YOUR_STORE}.myshopify.com

# テーマをストアへプッシュ
shopify theme push

# テーマをストアから取得
shopify theme pull

# CLI バージョン確認
shopify version
```

## Naming Conventions

すべてのファイル名は kebab-case。Rise / Dawn の慣習を踏襲。詳細表は README の `Conventions` セクション参照。

### File prefix convention（要点）

- `sections/main-*` → テンプレートのメイン領域専用（`main-product`, `main-cart-items` 等）
- `sections/featured-*` → ホーム等の訴求枠（`featured-collection` 等）
- `sections/cart-*` → カート関連
- `snippets/card-*` → カード型UI部品（`card-product`, `card-collection`）
- `snippets/icon-*` → アイコン
- `snippets/header-*` → ヘッダー部品
- `snippets/product-*` → 商品関連スニペット
- `assets/component-*.css` → 再利用CSSコンポーネント
- `assets/section-*.css` → セクション固有CSS
- `assets/template-*.css` → テンプレート固有CSS

### コード規約

- CSS クラス: BEM ライク（`.product-card__title`, `.hero-banner--fullwidth`）
- JavaScript: モジュール単位で `assets/` に配置、Vanilla JS (ES6+)
- Liquid 変数: snake_case（`product_title`, `featured_collection`）
- 新規セクション/スニペット作成時は上記プレフィックス慣習に従う。判断に迷う場合は機能ベース命名でOK

## Cross-Platform Notes

- 開発環境: Windows（Bash / PowerShell）と macOS の両方で作業
- 行末コード: `.gitattributes` により LF に統一済み
- `shopify.theme.toml` は `.gitignore` 対象（ストア URL・テーマ ID が含まれるため環境ごとに異なる）
- Shopify CLI は各環境で別途インストール・認証が必要

## Content Policy

- 実在サイトの画像・ロゴ・商品名・文章・ブランド表現は使用しない
- プレースホルダーには Shopify 標準の `{{ 'image' | placeholder_svg_tag }}` を使用
- 商品名・説明文はオリジナルのデモデータ（架空のケーキ店設定）を使用
