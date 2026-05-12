# Admin Setup Guide

Shopify 管理画面（admin）でのみ完結する設定をまとめたガイド。テーマ側コードでは扱えない／扱わない部分です。

## 1. 商品にサイズ（ホールサイズ）バリアントを追加する

Phase 3b の `tab-size-guide` で表示している「3号〜7号」の目安と整合させるための設定。

### 手順

1. Shopify admin → **商品管理 / Products**
2. 対象商品（例：`strawberry-shortcake`）を開く
3. **バリエーション / Variants** セクションで「**オプションを追加 / Add an option**」
4. 以下のオプションを設定：

   | 項目 | 値 |
   |---|---|
   | オプション名 / Option name | `サイズ` |
   | オプション値 / Option values | `3号`, `4号`, `5号`, `6号`（カンマ区切りで入力） |

5. 各バリアントごとに価格・在庫を設定

### 推奨価格設定（Sweet Atelier ベース）

| サイズ | 直径 | 目安人数 | 推奨価格（税込）|
|---|---|---|---|
| 3号 | 9cm | 2〜3名 | ¥3,800 |
| 4号 | 12cm | 3〜4名 | ¥4,800 |
| 5号 | 15cm | 5〜6名 | ¥5,800 |
| 6号 | 18cm | 7〜8名 | ¥6,800 |

> 7号・8号は記念日商品（アニバーサリーコレクション）にのみ用意するのが運用上シンプル。

### 注意事項

- **在庫管理を有効にしている場合**：各バリアントごとに在庫数を設定（手作りケーキは「在庫を追跡しない / Don't track quantity」推奨）
- **重さ / Weight**：冷凍便の送料計算に影響するため正確に入力
- **SKU**：在庫管理する場合のみ（例：`SA-STRAWBERRY-04` = Sweet Atelier / イチゴ / 4号）
- **商品画像とバリアントの関連付け**：サイズ違いで写真が同じなら未関連でOK

### バリアントが追加できない商品

- ロールケーキ（`matcha-roll`）
- 焼き菓子ギフト（`baked-goods-gift`）
- カットケーキ・季節限定の単品商品

これらは `tab-size-guide` の補足文「※ ロールケーキ・焼き菓子・カットケーキ等は形状が異なるため『商品仕様』をご確認ください」で案内されます。

---

## 2. variant_picker の表示制御

テーマ側 (`templates/product.json`) で：

```json
"variant-picker": {
  "type": "variant_picker",
  "settings": {
    "picker_type": "button",  // "dropdown" or "button"
    "swatch_shape": "circle"
  }
}
```

- `picker_type: "button"` → サイズ選択は「3号 / 4号 / 5号 / 6号」のボタン横並び
- `picker_type: "dropdown"` → セレクトボックス
- ホールサイズはボタン推奨（タップ領域大きく、選択肢可視性高い）

main の `settings.hide_variants: true` でデフォルト Variant（バリアントなし商品）の picker を自動非表示にする挙動はそのまま。

---

## 3. コレクションへの商品追加

Phase 1 で作成済みのコレクション（signature / seasonal / anniversary / gifts / baked-goods）に新商品を追加する場合：

1. 商品ページ → **商品の整理 / Organization** → **コレクション / Collections** に追加
2. コレクションページで並び順を調整（手動 / アルファベット / 価格 / 新着等）
3. 公開状態 / Publication を **オンラインストア / Online Store** で公開に

---

## 4. お届け日・ギフトオプションの注文確認（Phase 3c / 3d）

Phase 3c で `properties[熨斗]` `properties[熨斗の用途]` `properties[熨斗の名入れ]` `properties[メッセージカード]` `properties[ギフトラッピング]`、Phase 3d で `properties[お届け希望日]` `properties[お届け時間帯]` を line item property として送信しています。

### 注文管理画面での確認

注文管理 → 注文詳細 → 各 line item の下に **追加情報 / Properties** として表示されます。フルフィルメント担当者が見る前提で、PDF 注文票・梱包伝票へのプリントレイアウトは別途調整が必要です(Shopify 標準では出力されないテンプレートあり)。

### Bogus Gateway でテスト注文

Phase 3 クロージング時に1件は流して以下を確認:

- properties が注文管理に正しく反映されること
- 受注メールに properties が出ること(`Order confirmation` メールテンプレート編集が必要なら admin → 設定 → 通知 から HTML/Liquid を調整)
- お届け日が水曜にならないこと(JS 側のバリデーションは送信時点では Shopify 側に届くので、注文を見て監査する運用)

---

## 5. 商品タグで「新商品 / 季節限定 / 人気」バッジを表示する（Phase 3e）

`snippets/card-product-extra-badge.liquid` がカード/PDP の price 表示にバッジを描画します。表示優先度は **popular > seasonal > new**(同時複数タグでも 1 つのみ表示)。sold-out / sale 時はそちらが優先され、タグバッジは非表示。

### 手順

1. 管理画面 → 商品管理 → 対象商品を開く
2. 右サイドバー **タグ / Tags** に以下のいずれかを追加:

   | タグ | 表示ラベル | 用途 |
   |---|---|---|
   | `new` | 新商品 | 入荷から 1〜2 ヶ月以内 |
   | `seasonal` | 季節限定 | 季節のケーキコレクションの商品 |
   | `popular` | 人気 | 注文数上位の商品 |

3. 保存

### 注意事項

- タグは半角小文字英字。`New` `seasonal-spring` などはマッチしません。
- 1 商品に複数タグを付けても表示されるバッジは 1 つだけ(優先度は上記表)。
- ストア通貨フォーマット連動: 管理画面 → 設定 → 一般 → ストア通貨 → 「フォーマットの編集」で `money_with_currency_format` 末尾の ` JPY` を削除してください(カート画面の `¥3,800 JPY` → `¥3,800` 表示のため)。

---

## 6. 補助ページの作成とテンプレート割当（Phase 3f）

`templates/page.delivery.json` `page.faq.json` `page.legal.json` `page.store-info.json` の 4 つの専用テンプレートをテーマ側で用意済み。各テンプレートは管理画面で「ページ」を作成して割り当てることで有効になります。

### 共通手順

1. 管理画面 → **オンラインストア → ページ → ページを追加**
2. **タイトル**(下表参照)を入力
3. **コンテンツ**は空欄でも可(テンプレートの各セクションが本体)。リード文を補足したい場合のみ入力
4. 右下 **テンプレート** で対応するテンプレートを選択
5. ページ右下 **検索エンジンリスティング → 編集 → URL とハンドル** を下表のハンドルに合わせる(初期値は日本語タイトルから自動生成された日本語ハンドルになるため、手動で英字に書き換える)
6. **公開状態 / Visibility** を「公開」に
7. 保存

### 4 ページの設定値

| ページ | タイトル | ハンドル | テンプレート |
|---|---|---|---|
| お届けについて | `お届けについて` | `delivery` | `delivery` |
| よくあるご質問 | `よくあるご質問` | `faq` | `faq` |
| 特定商取引法に基づく表記 | `特定商取引法に基づく表記` | `legal` | `legal` |
| アトリエのご案内 | `アトリエのご案内` | `store-info` | `store-info` |

### 注意事項

- **テンプレート一覧は live(発行中)テーマから取得されます**。`shopify theme dev` で開発テーマだけ最新化しても admin のドロップダウンには出ないため、`shopify theme push --theme=<live-theme-id>` で live を最新化してから admin 作業を行ってください。
- ハンドルを英字にしておくと、他ページからの相互リンク(`/pages/delivery` 等)が確実に動きます。
- アトリエのご案内ページの `image-with-text`（`shop_atelier`）セクションには `docs/seed-data/banners/11-store-exterior.png` を Files にアップロードのうえ設定済み（`templates/page.store-info.json` に `shopify://shop_images/11-store-exterior.png` を記述、`height: adapt`）。画像を差し替える場合は Files に新ファイルをアップロード → テーマカスタマイザ or 同テンプレートの `shop_atelier.settings.image` を更新。

---

## 7. フッターメニューに補助ページのリンクを追加する（Phase 3f）

テーマコード側ではメニュー項目を制御していません。リンク追加は admin の「メニュー」設定で行います。

### 手順

1. 管理画面 → **コンテンツ → メニュー**（Shopify が「メニュー」を「オンラインストア」配下から「コンテンツ」配下へ移動済み）
2. **フッターメニュー / Footer menu** を開く
3. 「メニュー項目を追加 / Add menu item」を 4 回繰り返し、以下を追加:

   | 名前 | リンク先(候補から選択 → ページ) |
   |---|---|
   | お届けについて | お届けについて(`/pages/delivery`) |
   | よくあるご質問 | よくあるご質問(`/pages/faq`) |
   | 特定商取引法に基づく表記 | 特定商取引法に基づく表記(`/pages/legal`) |
   | アトリエのご案内 | アトリエのご案内(`/pages/store-info`) |

   ※ リンク先候補は名前が似ていて取り違えやすい(「アトリエのご案内」項目に誤って `/pages/faq` を選んでしまう等)。追加後に各項目のリンク先 URL を必ず確認すること。

4. 並び順をドラッグで調整(推奨: お届けについて → よくあるご質問 → アトリエのご案内 → 特商法)
5. 保存

### メインメニュー(ヘッダー)への追加判断

- **お届けについて** や **よくあるご質問** はメインメニューにも入れて目立たせる派と、フッターのみで足りる派がある。Sweet Atelier では現状メインメニューが「アニバーサリー / 季節のケーキ / ギフト / 焼き菓子 / お問い合わせ」の 5 件で、これ以上増やすと SP で改行されるため **フッターのみ** が無難。
- どうしてもヘッダーに入れたい場合は「お問い合わせ」をフッター移動 → ヘッダーに「ヘルプ」グループを作って配下に「お届けについて」「よくあるご質問」をぶら下げるのも手。

---

## 8. ページ別 SEO description（meta-description）入力（Phase 4）

`layout/theme.liquid` で `page_description` (admin 入力) → `settings.brand_description` の優先順で `<meta name="description">` を出力します。`brand_description` 「季節と素材を映す、小さなケーキのアトリエ。」が全ページの fallback として使われるため、admin で何も入力しなくても meta は必ず出ます。

OGP / Twitter Card の `og:description` / `twitter:description`（`snippets/meta-tags.liquid`）も `page_description` → `shop.description` → `settings.brand_description` → `shop.name` の順で fallback します。admin にメタディスクリプションを入力すれば OGP も自動で揃います。

ただし **ページ毎に固有文言を出した方が SEO・CTR は強くなります**（特にホーム / 補助 4 ページ / コレクション）。下記の通り入力推奨です。

### 共通手順（admin → ページ / コレクション / ホーム）

1. 管理画面 → 対象ページを開く
2. 末尾の **検索エンジン表示 / Search engine listing → 編集**
3. **メタディスクリプション / Meta description** に下表の文言を入力（120〜160 文字目安）
4. 保存

### 推奨文言（Sweet Atelier ベース、デモ用）

| ページ | URL | メタディスクリプション |
|---|---|---|
| ホーム（オンラインストア → 環境設定 → タイトルとメタディスクリプション）| `/` | 季節と素材を映す、小さなケーキのアトリエ。アニバーサリー・季節のケーキ・ギフト・焼き菓子を全国へ冷凍配送。 |
| お届けについて | `/pages/delivery` | Sweet Atelier の配送について。冷凍便での全国配送、最短お届け日、定休日、解凍方法をご案内します。 |
| よくあるご質問 | `/pages/faq` | キャンセル・お届け日変更・アレルゲン・ギフトオプション等、お問い合わせの多いご質問にお答えします。 |
| 特定商取引法に基づく表記 | `/pages/legal` | 特定商取引法に基づく表記。販売事業者・所在地・連絡先・支払方法・返品交換ポリシー等を記載しています。 |
| アトリエのご案内 | `/pages/store-info` | Sweet Atelier の所在地・営業時間・ご連絡先。アトリエでの受け取り、店頭販売についてもご案内します。 |

### 注意事項

- **ホームのメタディスクリプションは admin の場所が異なります**: オンラインストア → 環境設定 → 「タイトルとメタディスクリプション」セクション内の「メタディスクリプション」欄
- 商品ページ（PDP）は `product.description` が自動で `page_description` に入るため、商品説明本文を充実させれば admin での個別入力不要
- コレクションページも `collection.description` 優先 → fallback で brand_description が出る
- 文言は **120〜160 文字** を目安に（Google 検索結果での見切れ回避）。短すぎても長すぎても SEO 効果が落ちる
- OGP/Twitter Card にもこの文言が反映される（`og:description` / `twitter:description`）。SNS シェア時のプレビュー文になるので、admin 入力推奨

---

## 更新ルール

- 新しい admin タスクが発生したら**末尾**に追加（番号は連番）
- 各セクションに「**手順 / 注意事項**」を必ず書く
- 推奨値はあくまで Sweet Atelier 想定。本番運用時は店舗運営に合わせて調整
