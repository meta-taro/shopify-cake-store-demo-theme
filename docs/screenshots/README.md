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
├── phase-4/           # Phase 4 完了時 (2026-05-11)
├── phase-5/           # Phase 5 進行中 (5a アレルゲン表示, 2026-05-12)
├── phase-5b/          # Phase 5 進行中 (5b 号数早見表, 2026-05-13)
├── phase-7/           # Phase 7 完了 (ギフト体験・操作後の状態, 2026-05-20)
├── phase-8/           # Phase 8 完了 (検索・フィルター・並べ替え, 2026-05-21)
└── ...
```

> **phase-7 は撮影方式が異なる**: ギフトオプションは操作（チェック ON / ラジオ選択 / 文字入力）後にしか現れないため、`scripts/capture-phase-7.mjs` がウィジェットを操作して `[data-gift-options]` 要素をクローズアップ撮影する（fullPage ではない）。命名も下記の 4 状態 × 2 viewport:
>
> - `01-wrapping-radios.png` — ラッピング ON・ラジオ 3 種（「リボン付き」選択中）
> - `02-counter-warning.png` — メッセージカード 92/100 字（アンバー警告色）
> - `03-counter-limit.png` — メッセージカード 100/100 字（赤系・限界色）
> - `04-noshi-preview.png` — 熨斗 ON・用途「御祝」+ 名入れ「田中」の紅白水引きプレビュー

各ディレクトリに以下のページを保管（Phase 3 以降は 8 枚 × 2 viewport、Phase 8 以降は 09 を加えた 9 枚 × 2 viewport）:

- `01-home.png` — トップページ
- `02-cart-empty.png` — 空カート
- `03-not-found.png` — 404 ページ
- `04-product-strawberry.png` — 商品詳細（苺のショートケーキ / Phase 3 機能フル装備）
- `05-page-delivery.png` — お届けについて
- `06-page-faq.png` — よくあるご質問
- `07-page-legal.png` — 特定商取引法に基づく表記
- `08-page-store-info.png` — アトリエのご案内
- `09-collection-all.png` — 全商品コレクション（Phase 8〜：絞り込みカラム＋並べ替え＋日本語タグバッジ）

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
- **フッター**: クイックリンク 4 件追加（お届け / FAQ / アトリエのご案内 / 特商法）

### phase-3 → phase-4 (2026-05-11)
- **撮影方法の改善**: `reducedMotion: "reduce"` を指定。phase-3 までは reveal-on-scroll で `opacity:0.01` のまま写っていたファーストビュー外セクション（ホームのキャンペーン / ブランド紹介 / クーポン、お届けページの「定休日について」「冷凍配送と解凍方法」など）が、phase-4 からは全部最終状態で写る。phase-3 のスクショ下部にあった大きな空白帯はこの旧挙動由来で、実機では発生しない
- **補足ページの見出し重複を解消**: `main-page` の h1（ページタイトル）と各ページ先頭セクションの見出しが同じ文言で二重になっていた問題を修正。`page.faq` / `page.legal` / `page.store-info` は intro リッチテキストの h1 見出しブロックを削除、`page.delivery` は info_grid multicolumn の `title` を「配送について」に変更（h1 と同文言の重複を避けつつ、空にすると起きる h1→h3 の見出しレベル飛び（Lighthouse `heading-order`）も防ぐ）。`page.legal` 末尾の「本ページについて」は h3→h2 に上げて h1→h3 飛びを解消
- 機能追加は無し（Phase 4 は a11y / SEO / meta タグ / OGP の仕上げが中心。詳細は [`docs/lighthouse-baseline.md`](../lighthouse-baseline.md) phase-4 セクション）

### phase-4 → phase-5 (2026-05-12)
- **5a アレルゲン表示**: PDP（04-product-strawberry）の「アレルゲン情報」行が、固定文から構造化テーブル（アレルゲン名 / 区分 ＋ コンタミネーション注記）に。商品メタフィールド `custom.allergens`（メタオブジェクト `allergen` のリスト）と `custom.allergen_contamination` を参照。メタフィールド未設定の商品は「準備中」表示
- **04 商品カード**: `custom.allergens` 設定済み商品に「アレルゲン情報あり」バッジ（`人気 / 季節限定 / 新商品` バッジが優先されるため、それらが付かない商品でのみ表示）
- スクショの差分は admin でメタフィールドを登録した後に反映される（`docs/admin-setup.md` §9）。テーマ側コードのみの状態では PDP は「準備中」表示

### phase-5 → phase-5b (2026-05-13)
- **5b 号数早見表**: PDP（04-product-strawberry）の「サイズの目安」行が、固定 `<ul>` から号数 / 直径の目安 / 目安人数の `<table>`（3〜7号）に。商品に「サイズ」バリエーション（号数）がある場合は該当行を強調し「この商品で選べます」バッジを表示。メタフィールド不使用・admin 作業なしなのでテーマ push のみで反映される

### phase-5b → phase-7 (2026-05-20)

（Phase 6（FAQPage / BreadcrumbList JSON-LD）は構造化データ中心で視覚差分が小さいため専用スクショは省略）

PDP（04-product-strawberry）のギフトオプションを操作後の 4 状態を要素クローズアップで記録:

- **7a ラッピング画像付きラジオ**: 「ギフトラッピングを付ける（無料）」ON で 3 種ラジオカード（シンプル / リボン付き / 箱入り、64×64 サムネ SVG）が出現。選択中は枠＋淡い影で強調。`repeat(auto-fit, minmax(13rem, 1fr))` で幅に応じ列数自動調整（390px で 2 列）
- **7b メッセージカード文字数カウンター**: textarea 直下に「N / 100 字」、90 字でアンバー（`#a45a14`）、100 字で赤系（`#b22a2a`）＋太字。tabular-nums で桁ズレなし
- **7c 熨斗プレビュー**: 用途・名入れ入力に連動し、和紙風カードに用途上段 / 紅白水引き SVG / 名入れ下段をリアルタイム表示

### phase-7 → phase-8 (2026-05-21)

- **撮影対象に 09-collection-all を追加**: `scripts/capture-screenshots.mjs` の PAGES に `/collections/all` を追加（Phase 8 以降は 9 枚 × 2 viewport）。静的 fullPage 方式は phase-3〜のものと同じ
- **09-collection-all**: コレクションページ左に絞り込みカラム（在庫状況 / 価格 / おすすめ〔タグ〕/ サイズ / アレルゲン情報）、右上に並べ替えドロップダウン、グリッドに日本語タグバッジ。絞り込み自体は Shopify「検索と発見」アプリで制御（テーマは `snippets/facets.liquid` で汎用描画）
- **タグバッジの日本語化**: 商品カードのバッジ用タグを英語（new/popular/seasonal）→日本語（人気/季節限定/新商品）に変更。タグ絞り込みの値に英語が出る問題を解消。バッジ見た目自体は phase-3e から不変
- 他ページ（01〜08）に視覚差分はほぼなし（Phase 8 はコレクションページ中心 + admin 設定が主体）

`shopify theme dev` でローカル開発サーバーを起動した状態で:

```bash
npm run screenshot:baseline                  # baseline/ に保存
npm run screenshot:baseline -- --label phase-1  # phase-1/ に保存
npm run screenshot:phase7                    # phase-7/ に保存（ギフトオプション操作後の状態）
```

スクリプト本体: [`scripts/capture-screenshots.mjs`](../../scripts/capture-screenshots.mjs)（静的 fullPage） / [`scripts/capture-phase-7.mjs`](../../scripts/capture-phase-7.mjs)（操作を伴う要素クローズアップ）

## 注意

- Shopify CLI の HMR が常時接続を張るため `networkidle` 待機がタイムアウトするが、スクリプトは catch して撮影を続行する（出力 PNG は問題なし）
- `fullPage: true` で撮っているのでスクロール込み全長キャプチャ。空セクションがあると下に空白ができる
- `animations_reveal_on_scroll` 有効時、ファーストビュー外のセクションは `opacity: 0.01` で待機するため、`fullPage` スクショだと「内容が空白に見える」帯ができる（[known-issues §9](../known-issues.md) と同じ原因）。`scripts/capture-screenshots.mjs` は `reducedMotion: "reduce"` を指定してこの待機を無効化しているので、phase-4 以降のスクショは全セクションが最終状態で写る。phase-3 以前のスクショに残る下部の空白帯はこの旧挙動由来
