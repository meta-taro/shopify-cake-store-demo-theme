# テスト項目書 — Phase 9: 回遊・パーソナライズ

> フロントエンドのみで完結（Shopify 設定・アプリ・メタフィールド不要）。状態はすべて
> `localStorage`（名前空間 `sweet-atelier:`）。対象機能: 9a 最近見た商品 / 9b ウィッシュ
> リスト / 9c 送料シミュレーター。
>
> - 正本の使い方・ID 採番・優先度は [`README.md`](./README.md) 参照
> - 実行は GitHub Issue（label `test`, `phase-9`）上で行う
> - 検証中の知見は [`improvement-rules.md`](./improvement-rules.md) に追記する

## テスト環境マトリクス

各 P1 項目は最低 PC Chrome ＋ いずれかのモバイルで実施する。

- [ ] PC Chrome
- [ ] PC Edge
- [ ] iPhone Safari（実機 or DevTools エミュレーション）
- [ ] Android Chrome

実施環境: `http://127.0.0.1:9292`（ローカル dev）または <https://sweet-atelier-demo.myshopify.com/>（パスワード `recamp`）

---

## 9a 最近見た商品

| ID | 優先 | 手順 | 期待結果 | 結果 | 証跡 |
|---|---|---|---|---|---|
| TC-9A-01 | P1 | 任意の商品ページを開く → DevTools で `localStorage['sweet-atelier:recently-viewed']` を確認 | 閲覧した handle が記録される。最大 12 件・最新が先頭。13 件目で最古が押し出される | ☐ | 要キャプチャ |
| TC-9A-02 | P1 | 別商品・トップ・コレクションを開く | 「最近見た商品」セクションにカードが並ぶ。**現在表示中の商品は除外**される | ☐ | [PC](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/07-recently-viewed.png) / [SP](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/mobile/07-recently-viewed.png) |
| TC-9A-03 | P2 | localStorage をクリアして再読込 | 履歴が空のときはセクション全体が非表示（見出しごと出ない） | ☐ | 要キャプチャ |

## 9b ウィッシュリスト

| ID | 優先 | 手順 | 期待結果 | 結果 | 証跡 |
|---|---|---|---|---|---|
| TC-9B-01 | P1 | コレクションページでカード右上のハートをクリック | カードのリンク遷移に奪われず、その場でトグルする | ☐ | [PC](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/04-wishlist-card-active.png) / [SP](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/mobile/04-wishlist-card-active.png) |
| TC-9B-02 | P1 | 複数の異なる商品でハートを ON → `localStorage['sweet-atelier:wishlist']` を確認 | 商品ごとに**正しい handle** が保存される（全件 "all" になる等の取り違えがない） | ☐ | 要キャプチャ |
| TC-9B-03 | P2 | ハート ON/OFF を切り替え、要素の `aria-pressed` を確認 | 追加で `true`、解除で `false` に切り替わる | ☐ | [PC](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/04-wishlist-card-active.png) |
| TC-9B-04 | P1 | ハートを追加・解除し、ヘッダーのハート件数バッジを見る | 件数が即時同期。0 件でバッジ非表示 | ☐ | [PC](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/05-wishlist-header-badge.png) / [SP](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/mobile/05-wishlist-header-badge.png) |
| TC-9B-05 | P1 | PDP のお気に入りボタンを押す | ラベルが「追加 ⇄ 削除」と `aria-pressed` を切替。ヘッダー件数とも同期 | ☐ | [PC](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/06-wishlist-pdp-button.png) / [SP](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/mobile/06-wishlist-pdp-button.png) |
| TC-9B-06 | P2 | `wishlist.js` が二重ロードされる状況を作る（戻る/進む等） | `const` 再宣言エラーが出ない（IIFE + `customElements.get` ガード） | ☐ | コンソール |
| TC-9B-07 | P3 | `/pages/wishlist` を開く | 保存済み商品のカードが並び、一覧でトグル解除するとその場で消える | ☐ | ⚠️未開通 |

> **TC-9B-07 は管理画面でのページ作成が前提**（テンプレート `page.wishlist`・ハンドル
> `wishlist`、`docs/admin-setup.md §12`）。未作成のため現状はブロック。作成後に実施する。

## 9c 送料シミュレーター

| ID | 優先 | 手順 | 期待結果 | 結果 | 証跡 |
|---|---|---|---|---|---|
| TC-9C-01 | P1 | `/pages/delivery` を開く | 「配送について」直後に送料シミュレーターが表示される | ☐ | 要キャプチャ |
| TC-9C-02 | P2 | 都道府県セレクトを開く | 47 都道府県が地域 optgroup で並ぶ（プレースホルダー含め 48 option） | ☐ | 要キャプチャ |
| TC-9C-03 | P1 | 各地域の都道府県を選ぶ | 配送区分と送料が出る（本州 ¥980 / 北海道・四国・九州 ¥1,280 / 沖縄 ¥1,800） | ☐ | [本州](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/01-shipping-honshu.png) / [沖縄](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/03-shipping-okinawa.png) |
| TC-9C-04 | P1 | 注文金額 ¥10,000 以上 / 未満で表示を確認 | ¥10,000 以上で送料無料表示（沖縄は対象外として明示）。未達は「あと ¥N で送料無料」 | ☐ | [送料無料](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/02-shipping-free.png) / [沖縄対象外](https://raw.githubusercontent.com/meta-taro/shopify-cake-store-demo-theme/develop/docs/screenshots/phase-9/desktop/03-shipping-okinawa.png) |
| TC-9C-05 | P2 | 都道府県を選んでリロード | 選択が `localStorage['sweet-atelier:shipping-pref']` に保存され、復元される | ☐ | 要キャプチャ |
| TC-9C-06 | P3 | シミュレーター下部の注記を確認 | 「※ 表示は目安です。確定送料は購入手続き画面でご確認ください。」が表示 | ☐ | 要キャプチャ |

## 共通（Phase 9 全体）

| ID | 優先 | 手順 | 期待結果 | 結果 |
|---|---|---|---|---|
| TC-9X-01 | P1 | `shopify theme check` を実行 | baseline（2 errors / 9 warnings）を超えない | ☐ |
| TC-9X-02 | P2 | モバイル幅（390px）で 9a/9b/9c を確認 | レイアウト崩れがない | ☐ |

---

## 証跡（スクリーンショット）

`scripts/capture-phase-9.mjs`（Playwright）で desktop / mobile 各 7 枚を撮影済み。9a/9b は
localStorage 操作・ウィジェット操作の「後」にしか現れないため、状態を作ってから対象要素だけ
クローズアップ撮影している（`locator.screenshot()` で bounding box に自動クリップ）。

```bash
# dev サーバー起動中に
pnpm run screenshot:phase9
```

撮影内容（`docs/screenshots/phase-9/{desktop,mobile}/`）:

| ファイル | 内容 | 対応 TC |
|---|---|---|
| `01-shipping-honshu.png` | 本州（東京都）の送料 ¥980 | TC-9C-03 |
| `02-shipping-free.png` | ¥10,000 で送料無料表示 | TC-9C-04 |
| `03-shipping-okinawa.png` | 沖縄県 ¥1,800・対象外注記 | TC-9C-03 / 04 |
| `04-wishlist-card-active.png` | カードのハート ON（`aria-pressed=true`） | TC-9B-01 / 03 |
| `05-wishlist-header-badge.png` | ヘッダー件数バッジ「1」 | TC-9B-04 |
| `06-wishlist-pdp-button.png` | PDP ボタン「お気に入りから削除」 | TC-9B-05 |
| `07-recently-viewed.png` | 最近見た商品セクション | TC-9A-02 |

> 撮影スクリプトは PDP ボタン（06）でひと工夫が要る: カード（04）で先頭商品を ON にした後、
> PDP の `firstProductHandle` が同じ商品を返すとクリックで OFF に戻ってしまう。`aria-pressed`
> を見て未追加のときだけクリックし、必ず ON 状態で撮るようにしている。

差込形式: 上表のとおり各 TC の「証跡」列から raw URL を参照（コミット後に解決）。

## 結果サマリ（実施時に記入）

- 実施日:
- 実施者:
- 環境:
- 結果: P1 ○/○　P2 ○/○　P3 ○/○
- 未消化・不具合（bug Issue 番号）:
