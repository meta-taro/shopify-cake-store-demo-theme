# docs/samples

Phase 16（CSV 一括登録の実務体験）用のサンプルファイル置き場。

## `products-sample.csv`

本リポジトリのデモ商品 5 件（計 12 バリアント）を、Shopify 標準の商品 CSV 形式で表したもの。

- **ヘッダー**: 2026-05 時点の現行表示名（`Title, URL handle, Description, …`）。読みやすさのため
  Google Shopping 列やストア固有メタフィールド列は省いた import 可能なサブセット。
- **画像**: 公開リポの raw URL（`docs/seed-data/products/*.png`）を参照。
- **正本データ**: [`docs/seed-data/products.md`](../seed-data/products.md)。
- **解説・落とし穴**: [`docs/spreadsheet-product-ops.md`](../spreadsheet-product-ops.md)。

### 使い方（学習用）

1. このファイルを Google Sheets にインポート（区切り＝カンマ）して構造を観察する。
2. 価格・在庫・タグ等を編集 → UTF-8 CSV でダウンロード。
3. 開発ストアの 管理画面 → 商品 → インポート で取り込み、往復を体験する。

> 実ストアを export すると、ここに加えてメタフィールド列（アレルゲン・販売期間など）や
> Google Shopping 列が並ぶ。`spreadsheet-product-ops.md` の「列の構成」を参照。
