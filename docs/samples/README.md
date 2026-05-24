# docs/samples

Phase 16（スプレッドシート起点の商品運用）用のサンプル置き場。

- `products-sample.csv` … Shopify 標準 CSV のサンプル（16a〜c）
- `google-sheets/` … スプレッドシートから直接同期する Apps Script（16d）

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

## `google-sheets/` （Phase 16d）

CSV のダウンロード → 管理画面でインポート、という往復をやめて、**スプレッドシートのボタン 1 つで
Shopify Admin GraphQL に直接 upsert する** Apps Script のセット。

- `Code.gs` — Apps Script 本体（メニュー追加・接続設定・`productSet` ミューテーション呼び出し・
  CSV フォールバック）
- `download.html` — フォールバックの CSV ダウンロード用ダイアログ

### 思想

- 店舗運用者は **日本語見出しの普通の表**を埋めるだけ。CSV のヘッダー名や handle のルールを
  意識しなくていい（コード側で吸収）
- ［ストアに同期］で **handle 基準の冪等 upsert**。何度押しても結果は同じ
- 結果は **行ごとに「同期結果」列**へ即時記録（`✓ 新規 / ✓ 更新 / ✗ <理由>`）
- 認証情報は **Apps Script の Script Properties** に置き、シート本体・リポジトリには絶対書かない

### 学習用の置き方

1. 新規 Google スプレッドシートを作成 → 拡張機能 → Apps Script
2. `Code.gs` の中身をコピー → `コード.gs` に貼り付け
3. ＋ → HTML → 名前 `download` → `download.html` の中身を貼り付け
4. シートに戻ってリロード → メニュー［Shopify］が表示される
5. 詳しい運用手順・セキュリティ・詰まりやすい点は
   [`docs/spreadsheet-product-ops.md` §7（Phase 16d）](../spreadsheet-product-ops.md#7-csv-往復を自動化する16d--google-apps-script-で直接同期)

> このファイルは **学習・スキル確認用のサンプル**で、受注案件で運用するスクリプトとは別物
> （受注案件の成果物は本リポジトリにはコミットされない `apps-script/` 側）。
