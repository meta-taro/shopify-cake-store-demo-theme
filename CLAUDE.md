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

- セクションファイル: ケバブケース（例: `hero-banner.liquid`, `featured-products.liquid`）
- スニペットファイル: ケバブケース（例: `product-card.liquid`, `icon-cart.liquid`）
- CSS クラス: BEM ライク（例: `.product-card__title`, `.hero-banner--fullwidth`）
- JavaScript: モジュール単位で `assets/` に配置（例: `product-card.js`）
- Liquid 変数: スネークケース（例: `product_title`, `featured_collection`）

## Cross-Platform Notes

- 開発環境: Windows（Bash / PowerShell）と macOS の両方で作業
- 行末コード: `.gitattributes` により LF に統一済み
- `shopify.theme.toml` は `.gitignore` 対象（ストア URL・テーマ ID が含まれるため環境ごとに異なる）
- Shopify CLI は各環境で別途インストール・認証が必要

## Content Policy

- 実在サイトの画像・ロゴ・商品名・文章・ブランド表現は使用しない
- プレースホルダーには Shopify 標準の `{{ 'image' | placeholder_svg_tag }}` を使用
- 商品名・説明文はオリジナルのデモデータ（架空のケーキ店設定）を使用
