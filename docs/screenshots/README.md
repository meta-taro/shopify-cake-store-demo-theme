# Screenshots

Phase ごとの「Before / After」比較用にストアフロントのスクリーンショットを保管する場所。

## ディレクトリ構造

```
docs/screenshots/
├── baseline/          # Phase 0: Rise 純正のまま
│   ├── desktop/       # 1280x900 viewport
│   └── mobile/        # 390x844 viewport (iPhone 14 相当)
├── phase-1/           # Phase 1 完了時（予定）
├── phase-2/           # Phase 2 完了時（予定）
└── ...
```

各ディレクトリに以下のページを保管:

- `01-home.png` — トップページ
- `02-cart-empty.png` — 空カート
- `03-not-found.png` — 404 ページ

（Phase 1 以降で商品が登録されたら `04-product.png`, `05-collection.png` 等を追加予定）

## 撮り方

`shopify theme dev` でローカル開発サーバーを起動した状態で:

```bash
npm run screenshot:baseline                  # baseline/ に保存
npm run screenshot:baseline -- --label phase-1  # phase-1/ に保存
```

スクリプト本体: [`scripts/capture-screenshots.mjs`](../../scripts/capture-screenshots.mjs)

## 注意

- Shopify CLI の HMR が常時接続を張るため `networkidle` 待機がタイムアウトするが、スクリプトは catch して撮影を続行する（出力 PNG は問題なし）
- `fullPage: true` で撮っているのでスクロール込み全長キャプチャ。空セクションがあると下に空白ができる
