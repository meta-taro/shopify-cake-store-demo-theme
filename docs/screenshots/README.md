# Screenshots

Phase ごとの「Before / After」比較用にストアフロントのスクリーンショットを保管する場所。

## ディレクトリ構造

```
docs/screenshots/
├── baseline/          # Phase 0: Rise 純正のまま (2026-05-01)
│   ├── desktop/       # 1280x900 viewport
│   └── mobile/        # 390x844 viewport (iPhone 14 相当)
├── phase-1/           # Phase 1 完了時 (2026-05-03)
├── phase-2/           # Phase 2 完了時 (2026-05-07)
├── phase-3/           # Phase 3 完了時 (2026-05-11)
└── ...
```

各ディレクトリに以下のページを保管（Phase 3 以降は 8 枚 × 2 viewport）:

- `01-home.png` — トップページ
- `02-cart-empty.png` — 空カート
- `03-not-found.png` — 404 ページ
- `04-product-strawberry.png` — 商品詳細（苺のショートケーキ / Phase 3 機能フル装備）
- `05-page-delivery.png` — お届けについて
- `06-page-faq.png` — よくあるご質問
- `07-page-legal.png` — 特定商取引法に基づく表記
- `08-page-store-info.png` — アトリエのご案内

## Phase 別の差分メモ

### baseline → phase-1 (2026-05-03)
- ロゴ「Sweet Atelier」表示、配色（オフホワイト/カカオブラウン/くすみピンク）適用
- メインメニューが「アニバーサリー / 季節のケーキ / ギフト / 焼き菓子 / お問い合わせ」に
- 告知バー（GW休業 / 季節のケーキ / 全国送料無料）追加
- ストア言語 = 日本語、UI ラベル全和訳化

### phase-1 → phase-2 (2026-05-07)
- ヒーロー: マーブル背景の季節ケーキ画像 + 80% 透過テキストパネル + CTA「季節のケーキを見る」
- 特集コレクション: 「定番のケーキ」signature 商品（4 列）
- コレクションリスト: 5 タイル順（定番→季節→アニバーサリー→ギフト→焼き菓子）
- キャンペーン (multicolumn): 春キャンペーン + 2+1 の 2 列横並び（モバイル縦積み）
- ブランド紹介 (image-banner): Sweet Atelier 横長
- レビュー10%OFFクーポン (image-banner): 横長

### phase-2 → phase-3 (2026-05-11)
- **PDP (04-product-strawberry)**: タブ×4 / 信頼バッジ / variant ピッカー (3号/4号/5号) / お届け日ピッカー / ギフトオプション / 税込 suffix / "新商品" バッジ
- **04 商品カード（home / collection）**: 税込 suffix + タグベースバッジ（new/seasonal/popular）
- **05-page-delivery**: 配送エリア / 送料 / 最短お届け / 冷凍配送と解凍方法
- **06-page-faq**: collapsible-content 8 Q&A
- **07-page-legal**: 特定商取引法 13 項目（架空情報）
- **08-page-store-info**: 所在地 / 営業時間 / 連絡先 + アトリエ紹介
- **フッター**: クイックリンク 4 件追加（お届け / FAQ / 店舗情報 / 特商法）

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
