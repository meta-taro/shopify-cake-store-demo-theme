# QA Checklist

公開前に踏む動線をまとめた手動QAチェックリスト。Phase 完了ごとに「自分が触った範囲」の項目を追記して育てる Living checklist。

## Live Demo URL

- <https://sweet-atelier-demo.myshopify.com/>
- ストアパスワード: `recamp`

実機での動作確認時はこのURLを使用する（ローカル `shopify theme dev` でも確認可）。

## 使い方

- Phase 完了時、または公開前に上から順に踏む
- 不具合があれば issue or `docs/known-issues.md` に記録（必要に応じて作成）
- Phase ごとに「今回追加した機能のチェック」を該当セクションへ追記する
- 抜け漏れに気づいたら都度足す（運用ドキュメントは育てるもの）

---

## 共通動線（baseline / Rise の時点でも踏める）

### トップページ
- [ ] ヒーローセクション表示（画像・CTAボタン）
- [ ] ヘッダーのナビゲーション全リンクが開く
- [ ] ロゴクリックでトップへ戻る
- [ ] フッターのリンク全部開く（404 が出ない）
- [ ] ニュースレター登録フォーム表示

### 商品詳細ページ
- [ ] 商品画像表示・拡大
- [ ] バリアント切替（在庫あり / 売切時の表示差）
- [ ] 「カートに追加」→ カート反映
- [ ] 商品説明（タブ・アコーディオン）開閉
- [ ] パンくず表示

### コレクションページ
- [ ] 商品一覧表示
- [ ] 商品カードクリック → 商品詳細へ遷移
- [ ] フィルタ・ソート操作（あれば）
- [ ] ページネーション（商品数 > ページサイズの時）

### カート
- [ ] 数量増減
- [ ] 商品削除
- [ ] 「チェックアウトする」→ 決済画面遷移
- [ ] 空カート時の表示

### 検索
- [ ] 検索バーから商品が引ける
- [ ] 検索結果ゼロ件の表示
- [ ] サジェスト（predictive search）

### 404 / エラー
- [ ] 存在しないURLで 404 ページが正しく出る

---

## デバイス／ブラウザマトリクス

各動線を以下の組み合わせで踏む（最低限）。

- [ ] PC Chrome
- [ ] PC Edge
- [ ] iPhone Safari（実機 or DevTools エミュレーション）
- [ ] Android Chrome

実機テストはキャンペーン前など要所では必須。日常開発ではエミュレーションでもOK。

---

## Phase ごとの追加項目

### Phase 1: ストア設定・ダミーコンテンツ（2026-05-03 完了）

ブランド設定・商品/コレクション登録・ロケール調整までの確認項目。

#### ブランド設定
- [ ] ロゴ画像（Sweet Atelier 横書き）が表示・幅 240–280px で適切
- [ ] ブランドカラー（オフホワイト背景 / カカオブラウン文字 / くすみピンク Scheme 2）が反映
- [ ] 見出し明朝（Shippori Mincho B1 系）/ 本文ゴシック（Noto Sans JP）が適用
- [ ] ブランド見出し「Sweet Atelier」/ 説明文「季節と素材を映す、小さなケーキのアトリエ。」がフッター等に出る

#### ナビゲーション・告知
- [ ] メインメニューが「アニバーサリー / 季節のケーキ / ギフト / 焼き菓子 / お問い合わせ」順
- [ ] 各メニュー項目から正しいコレクションページ / ページに遷移する
- [ ] 告知バー（複数ブロック登録済、auto_rotate は Phase 2 以降で再検討）

#### ロケール
- [ ] ストアのデフォルト言語が日本語（English は非公開）
- [ ] 商品詳細の UI ラベル（数量 / カートに追加する / 今すぐ購入）が日本語
- [ ] カートドロワーの空状態メッセージ（カートの中身が空です / 買い物を続ける）が日本語
- [ ] 通貨が ¥ 表記（JPY）

#### 商品・コレクション
- [ ] コレクション 5 件（signature / seasonal / gifts / baked-goods / anniversary）作成済
- [ ] 商品 5 件（苺ショート / クラショコラ / 桜苺タルト / クッキー缶 / アニバーサリー）登録済
- [ ] 全商品に画像・ALT・タグ・コレクション割当・SEO ハンドル・在庫数あり
- [ ] `/products/{handle}` × 5 ページが localhost で表示できる
- [ ] `/collections/{handle}` × 5 ページが localhost で表示できる（割当商品が並ぶ）

#### カート（Phase 3 で本格テスト、ここでは表示確認のみ）
- [ ] 商品詳細「カートに追加」→ カートアイコンに数量バッジ
- [ ] 🛒 アイコン押下でカートドロワーが横から出る（notification ではなく drawer）
- [ ] `/cart` 直アクセスで空カート時の表示が正常

#### 既知の未対応（Phase 2 以降）
- ホーム: Image slide / 特集コレクションのプレースホルダー画像 / Collapsible content は未差し替え（Phase 2/3 で対応）
- ホーム: ヒーローセクションのコピー・CTA は未設定（Phase 2）
- 決済テスト（Bogus Gateway）は Phase 3 末尾で実施予定

### Phase 2: トップページカスタマイズ（2026-05-07 完了）

ホームページをデフォルトの Rise プレースホルダーから Sweet Atelier 仕様に差し替えた範囲の確認項目。

#### ヒーロー（slideshow）
- [ ] ヒーロー画像 `01-hero-seasonal.png`（マーブル背景）が表示
- [ ] 見出し「季節のケーキ、はじめました」が表示
- [ ] サブ「春の素材を、ひと皿に。」が表示
- [ ] CTA「季節のケーキを見る」→ `/collections/seasonal` 遷移
- [ ] テキストパネルが半透明（不透明度 0.8、`rgba(var(--color-background), 0.8)`）でマーブルがうっすら透ける
- [ ] `backdrop-filter: blur(4px)` で背景がぼかされている

#### 特集コレクション（featured-collection）
- [ ] 「定番のケーキ」見出しが表示
- [ ] `signature` コレクションの 2 商品が 4 列レイアウトで表示
- [ ] 「すべて見る」ボタンは現在非表示（商品数 ≤ products_to_show=4、Rise 仕様で自動制御）

#### コレクションリスト（collection-list）
- [ ] 5 タイル: **定番→季節のケーキ→アニバーサリー→ギフト→焼き菓子** の順
- [ ] 各タイルに対応した画像 `02-06` が表示
- [ ] タイルクリックで該当 `/collections/{handle}` に遷移

#### キャンペーン（multicolumn）
- [ ] デスクトップ：`07-campaign-spring.png` と `08-campaign-2plus1.png` が 2 列横並び
- [ ] モバイル：自動縦積み（`columns_mobile: "1"`）
- [ ] 焼込テキストが切れずに全文読める（`image_ratio: "adapt"` 動作）

#### ブランド紹介（image-banner）
- [ ] `10-brand-intro.png` が 3:1 で全幅表示
- [ ] 焼込テキストが切れない（`image_height: "adapt"`）

#### レビュークーポン（image-banner）
- [ ] `09-campaign-review-coupon.png` が表示・テキスト切れなし

#### レスポンシブ
- [ ] PC（1280×900）：全セクション横並びで崩れなし
- [ ] モバイル（390×844）：全セクション縦積みで読みやすい

#### 既知の未対応（Phase 3 以降）
- キャンペーン 2 画像（07/08）にクリック先リンク未設定（学習デモなので必要に応じて追加）
- ブランド紹介画像（10）にもリンク未設定
- `特集コレクション` の「すべて見る」は signature 商品数を増やせば自動表示される
- `shopify theme check` の 2 errors / 9 warnings は Rise ベースライン由来で受け入れ済み（`memory/project_theme_check_baseline.md` 参照）

### Phase 3: 商品詳細・カートUX・補助ページ（2026-05-11 完了）

#### PDP 基本拡張（3a）
- [ ] collapsible_tab × 4-5（仕様 / サイズ・保存方法 / 配送について / アレルゲン情報）が開閉
- [ ] 信頼バッジ 3 件（冷凍配送 / お届け日指定 / アレルゲン記載）が PDP に表示
- [ ] 関連商品（complementary_products）ブロックが商品下部に並ぶ
- [ ] パンくず動作確認

#### バリアント・サイズ選択 UI（3b）
- [ ] サイズ選択 variant_picker がボタン形式（3号 / 4号 / 5号 / 6号）
- [ ] サイズ切替で価格・在庫表示が更新
- [ ] バリアントなし商品は picker 自動非表示（`settings.hide_variants: true`）

#### ギフトオプション（3c）
- [ ] 熨斗 ON/OFF トグルで用途 select + 名入れ input の出し入れ（progressive disclosure）
- [ ] メッセージカードに 100 文字制限が効く
- [ ] ギフトラッピング ON/OFF
- [ ] 「カートに追加」後、カート画面の line item の下に properties（熨斗 / 用途 / 名入れ / メッセージ / ラッピング）が表示
- [ ] gift_card 商品では gift-options 全体が非表示

#### お届け日ピッカー（3d）
- [ ] 最短選択可能日 = 今日+3日（営業日基準）
- [ ] 最長選択可能日 = 今日+30日
- [ ] 水曜を選択すると入力 clear + 警告メッセージ表示
- [ ] 時間帯 select（午前中 / 14-16 / 16-18 / 18-20 / 19-21）が選べる
- [ ] カート画面で properties[お届け希望日] [お届け時間帯] が表示

#### 商品カード強化（3e）
- [ ] 商品カードに `popular > seasonal > new` の優先度でバッジ 1 つ表示
- [ ] sold-out / on_sale 時はタグバッジが非表示（既存バッジ優先）
- [ ] 商品カードの価格に「税込」suffix 表示
- [ ] PDP の価格にも「税込」suffix + タグバッジが表示
- [ ] 通貨フォーマット末尾の `JPY` が削除されている（admin の `money_with_currency_format` 編集後）

#### 補助ページ（3f）
- [ ] `/pages/delivery` 表示確認（送料表 / 冷凍配送 / 解凍方法）
- [ ] `/pages/faq` 表示確認（8 Q&A 開閉動作）
- [ ] `/pages/legal` 表示確認（13 項目 / 末尾に demo disclaimer）
- [ ] `/pages/store-info` 表示確認（所在地 / 営業時間 / 連絡先 / アトリエ紹介）
- [ ] フッターのクイックリンクから 4 ページに遷移できる

#### 既知の未対応（Phase 4 で対応）
- [ ] アレルゲン構造化データ（metafield ベース）は Phase 3g として未実施（任意・スキップ）
- [x] `image-with-text` セクション（アトリエのご案内ページのアトリエ写真）に `11-store-exterior.png` を設定済み（2026-05-12）
- [ ] レスポンシブ細部・Lighthouse 計測は Phase 4 で対応

### Phase 4: 仕上げ・公開準備（2026-05-11 完了）

a11y / SEO / meta タグ / OGP の仕上げと公開前リハーサル。Phase 4 では機能追加は無し（既存挙動の精度を上げる回）。詳細所見は [`docs/lighthouse-baseline.md`](./lighthouse-baseline.md) / [`docs/known-issues.md`](./known-issues.md)。

#### SEO / メタタグ / OGP
- [ ] `/` `/pages/delivery` `/pages/faq` の `<head>` に `<meta name="description">` が出る（`page_description` 未設定時は `settings.brand_description` にフォールバック）
- [ ] PDP は商品 description ベースで `<meta name="description">` が出る
- [ ] `<head>` に OGP（`og:title` / `og:description` / `og:image` / `og:url` / `og:type`）と Twitter Card が出る
- [ ] `og:description` は `page_description` → `shop.description` → `settings.brand_description` → `shop.name` の順でフォールバックする
- [ ] `og:image` は `page_image`（記事/商品/ページのソーシャル画像）→ `settings.brand_image` の順でフォールバックする
- [ ] admin で per-page の SEO description を入れた場合はそちらが優先される（任意・手順 `docs/admin-setup.md` §8）

#### アクセシビリティ（Lighthouse a11y）
- [ ] PDP の `color-contrast` 指摘が解消（税込 suffix / ギフトオプションの "任意" ラベル / お届け日の注記 = 不透明度 0.8）
- [ ] PDP の数量入力に `aria-label`（または `<label>`）が紐づいている
- [ ] 残る a11y −3 はフッターのニュースレター見出し/入力欄が reveal-on-scroll の `opacity:0.01` 待機中にスナップショットされる偽陽性（known-issues §9）— 実機では問題なし

#### パフォーマンス（Lighthouse perf）
- [ ] PDP のメイン商品画像（ギャラリー先頭）が `loading="eager"` + `fetchpriority="high"` で出る（LCP 前倒し）
- [ ] ギャラリー 2 枚目以降 / サムネイルは `loading="lazy"`
- [ ] `unused-css-rules` / `unused-javascript` / `server-response-time` 等の指摘は Rise バンドル設計 or dev サーバー固有として据え置き

#### Best Practices（Lighthouse）
- [ ] Best Practices が 73（PDP 54）で頭打ちなのは確認済（Shop Pay の third-party cookie / shop.app iframe の CSP 違反 / Chrome 将来仕様の deprecation 警告 — いずれも Shopify プラットフォーム側 or `theme dev`（http）固有でテーマからは改善不可、known-issues §10）

#### 補助ページの見出し
- [ ] `/pages/faq` `/pages/legal` `/pages/store-info` で `<h1>` がページ内に 1 つだけ（`main-page` のタイトル h1 と先頭セクションの見出しが二重になっていない）
- [ ] `/pages/delivery` 先頭の multicolumn にダブり見出しが出ていない

#### スクリーンショット / Lighthouse 記録
- [ ] `npm run screenshot:baseline -- --label phase-4` で 8 ページ × 2 viewport が撮れる
- [ ] reveal-on-scroll セクション（ホームのキャンペーン/ブランド紹介、お届けページ下部など）が最終状態で写る（`reducedMotion: "reduce"` 指定済 — phase-3 以前の下部空白帯は出ない）
- [ ] `npm run lighthouse:capture -- --label phase-4` 実行 → `docs/lighthouse/phase-4/summary.md` 生成、スコアを `docs/lighthouse-baseline.md` に記録
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

### Phase 5: 商品情報の充実（進行中）

#### 5a アレルゲン表示（2026-05-12）

テーマ側: `snippets/product-allergen-table.liquid` / `assets/component-allergen-table.css` 追加、`sections/main-product.liquid` の `collapsible_tab` に `show_allergens` チェック追加、`templates/product.json` の `tab-allergen` で `show_allergens: true`、`snippets/card-product-extra-badge.liquid` にバッジ追加。
admin 側: 各商品の標準「アレルゲン情報」カテゴリーメタフィールドに値を設定（`docs/admin-setup.md` §9）。任意で `custom.allergen_contamination`（複数行テキスト）を定義してコンタミ注記を入力。

- [x] PDP「アレルゲン情報」行を開くと、固定文ではなく表（アレルゲン名 / 区分）が出る（苺のショートケーキ = 卵/乳/小麦 で確認）
- [x] 区分列に「特定原材料」「推奨表示」が出る（テーマ側で 8 特定原材料リストから自動判定。卵/乳/小麦/くるみ→特定原材料、大豆/アーモンド→推奨表示）
- [x] アレルゲンの並び順が標準メタフィールドで設定した順になっている
- [x] コンタミネーション注記（`custom.allergen_contamination`）が表の下に出る（改行が `<br>` で反映）※注記を設定した商品のみ（苺のショートケーキで確認）
- [ ] アレルゲン未設定の商品では「アレルゲン情報は現在準備中です」と出る（エラーにならない）
- [ ] テーマカスタマイザで「アレルゲン表を表示する」チェックを OFF にすると表が消える
- [ ] 商品カード（home / collection）でアレルゲン設定済み商品に「アレルゲン情報あり」バッジが出る（ただし `人気 / 季節限定 / 新商品` バッジが優先）
- [x] アレルゲン表のコントラスト比が 4.5:1 以上（茶系テキスト on オフホワイト / サンドベージュ）
- [x] `<table>` に `<caption>`（visually-hidden）と `<th scope>` が付いている（スクリーンリーダー）
- [ ] （任意）「検索と発見」アプリで標準「アレルゲン情報」メタフィールドをフィルター追加 → コレクションページに絞り込みが出る
- [x] `npm run screenshot:baseline -- --label phase-5` で撮影 → `docs/screenshots/phase-5/`
- [x] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

#### 5b 号数早見表（2026-05-13）

テーマ側: `snippets/product-size-guide.liquid` / `assets/component-size-guide.css` 追加、`sections/main-product.liquid` の `collapsible_tab` に `show_size_guide` チェック追加、`templates/product.json` の `tab-size-guide` で `show_size_guide: true`（旧 `content` の固定 `<ul>` は短い補足文に置換）。admin 作業なし（メタフィールド不使用）。

- [x] PDP「サイズの目安」行を開くと、号数 / 直径の目安 / 目安人数の表（3〜7号）が出る（ローカル + live で確認）
- [x] 「サイズ」バリエーションを持つ商品（苺のショートケーキ等）では、該当号数の行が強調され「この商品で選べます」バッジが付く
- [ ] 「サイズ」バリエーションが号数でない商品（アトリエクッキー缶 = S/M）では全行が一般目安として表示され、強調なし（エラーにならない）
- [ ] テーマカスタマイザで「号数早見表を表示する」チェックを OFF にすると表が消える
- [x] 表のコントラスト比が 4.5:1 以上（バッジ = 白文字 on ココアブラウン `--color-base-text`）
- [x] `<table>` に `<caption>`（visually-hidden）と `<th scope>` が付いている
- [x] モバイル幅で表が横スクロール可能（`overflow-x: auto`）／バッジが折り返す
- [x] `npm run screenshot:baseline -- --label phase-5b` で撮影 → `docs/screenshots/phase-5b/`（16 枚、PDP 04 は健全レンダリングを目視確認。表自体は collapsible_tab 折りたたみ内なのでスクショには写らない＝phase-5a と同じ扱い）
- [x] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

#### 5c 季節商品の販売期間バッジ + カウントダウン（2026-05-18）

テーマ側: `snippets/product-sale-period.liquid` / `assets/component-sale-period.css` / `sections/seasonal-sale-announcement.liquid` を新設。`sections/main-product.liquid` に `sale_period` ブロックを追加し `templates/product.json` の `block_order` に `sale-period` を挿入。`templates/collection.seasonal.json` を新規追加し、`/collections/seasonal` の上に announcement セクションを乗せる。`snippets/card-product-extra-badge.liquid` を更新し、seasonal タグ + 販売期間内のとき「季節限定 ・ 残り N 日」表示、終了後は seasonal バッジを非表示にして優先度を次に譲る。
admin 側: `custom.sale_start` / `custom.sale_end` 日付メタフィールドを定義し、季節商品（桜と苺のタルト等）に値を設定（`docs/admin-setup.md` §10）。

##### PDP 表示
- [ ] 販売期間内の商品 PDP（桜と苺のタルト等）で、価格直下に「🌸 季節限定 ・ 販売は MM/DD まで・残り N 日」バナーが出る
- [ ] 残り日数 ≤ 7 日（テーマカスタマイザのしきい値）でバナーが暖色（`--ending` 修飾）に切り替わる
- [ ] 残り 1 日で「残り 1 日」、当日（終了日）で「本日が最終日です」と表示される
- [ ] `sale_start` を未来日付に設定した商品では「MM/DD から販売開始・あと N 日」と出る（PDP `--pre`）
- [ ] `sale_end` が過去日付の商品では「販売終了」表示（`--ended`、グレー）
- [ ] メタフィールド未設定の商品（苺のショートケーキ等）では PDP バナーが出ない（エラーにならず、価格直下が従来通り）
- [ ] テーマカスタマイザで「販売期間バナー」ブロックを削除するとバナーが消える

##### 商品カードバッジ
- [ ] 販売期間内の seasonal 商品のカードバッジが「季節限定 ・ 残り N 日」表示（home / コレクション / 検索結果）
- [ ] 販売終了後は seasonal バッジが消え、次優先（`new` または「アレルゲン情報あり」）に切り替わる
- [ ] メタフィールド未設定 + seasonal タグのみの商品は従来通り「季節限定」表示（互換性維持）
- [ ] `popular` タグ付きの商品は seasonal より優先される（既存挙動を壊さない）

##### コレクションお知らせ枠
- [ ] `/collections/seasonal` のグリッド上部に「現在販売中の季節商品」リストが出る（販売期間内の商品のみ、`残り N 日` 付き）
- [ ] 該当商品ゼロ件（全商品が販売終了 or メタフィールド未設定）の場合、announcement セクション自体が描画されない
- [ ] リスト内の商品名クリックで該当 PDP に遷移
- [ ] テーマカスタマイザで見出し・サブテキスト・最大表示件数（既定 6）を編集できる

##### アクセシビリティ・スタイル
- [ ] バナーの色コントラスト（暖色 `--ending` の赤茶 `#b85a2b` on ピンク背景）が 4.5:1 以上
- [ ] `<time datetime="YYYY-MM-DD">` で機械可読な日付がマークアップされている
- [ ] モバイル幅でバナーがレイアウト崩れせず、カウントダウンが折り返す

##### 計測
- [ ] `npm run screenshot:baseline -- --label phase-5c` で撮影 → `docs/screenshots/phase-5c/`
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

### Phase 6: SEO・構造化データ仕上げ（進行中）

#### 6a FAQPage JSON-LD（2026-05-19）

テーマ側: `sections/faq-jsonld.liquid` を新規追加（視覚 UI なし・JSON-LD `<script>` のみ出力）、`templates/page.faq.json` の `order` に `faq_jsonld` を追加し、`faq_main` と同じ Q&A 8 件を `qa` ブロックとして複製配置。
admin 側: 作業不要。Q&A を変更するときは theme editor で `faq_main` と `faq_jsonld` 両セクションのブロックを揃える運用。

- [ ] `/pages/faq` の HTML ソースに `<script type="application/ld+json">` で `"@type": "FAQPage"` ブロックが出力されている
- [ ] `mainEntity` 配列に 8 件の `Question` が並び、各 `acceptedAnswer.text` から HTML タグが除去されたプレーン文になっている
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) に `https://sweet-atelier-demo.myshopify.com/pages/faq?password=recamp` を流して「FAQ」が検出され、エラーなしで通る
- [ ] [Schema.org Validator](https://validator.schema.org/) でも JSON-LD が無効としてフラグされない
- [ ] 視覚 UI（`faq_main` の collapsible-content）には影響がなく、見た目は従来通り
- [ ] FAQ ページ以外のページ（home / PDP 等）には `FAQPage` JSON-LD が出力されていない（theme editor 上 `enabled_on.templates = ["page"]` で `page.faq` 以外には追加されない設計）
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

#### 6b BreadcrumbList JSON-LD + パンくず UI（2026-05-19）

テーマ側: `snippets/breadcrumb.liquid` を新規追加（視覚 UI + `BreadcrumbList` JSON-LD を同一スニペットで生成）、`assets/component-breadcrumb.css` で BEM 風スタイル。`sections/main-product.liquid` / `sections/main-page.liquid` / `sections/main-collection-product-grid.liquid` の冒頭で `{% render 'breadcrumb' %}` を呼ぶ。admin 作業なし。

##### 視覚 UI
- [ ] PDP（例 苺のショートケーキ）の上部に「ホーム › 商品名」のパンくずが出る
- [ ] `/collections/{handle}/products/{handle}` 経由で開いた商品では「ホーム › コレクション名 › 商品名」と 3 階層になる
- [ ] コレクション一覧（`/collections/all`, `/collections/seasonal` 等）の上部に「ホーム › コレクション名」が出る
- [ ] page 系（`/pages/faq` `/pages/delivery` `/pages/legal` `/pages/contact` `/pages/store-info`）に「ホーム › ページタイトル」が出る
- [ ] home（`/`）/ cart / search / 404 / account 系にはパンくずが出ない
- [ ] パンくずリンク（ホーム / コレクション）クリックで遷移できる
- [ ] 現在ページに対応する末尾 item は `<span>`（リンクではない）で表示され `aria-current="page"` 付き

##### 構造化データ
- [ ] HTML ソースに `<script type="application/ld+json">` で `"@type": "BreadcrumbList"` が出力されている
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) で「Breadcrumbs」が検出され、エラーなしで通る（PDP / コレクション / page 各 1 件）
- [ ] [Schema.org Validator](https://validator.schema.org/) でも無効としてフラグされない
- [ ] `itemListElement[].item` が絶対 URL で出力される（末尾要素には `item` を含めない仕様）

##### アクセシビリティ・スタイル
- [ ] `<nav aria-label="パンくずリスト">` + `<ol>` 構造でセマンティック
- [ ] パンくずテキストのコントラスト比が 4.5:1 以上（`rgba(--color-foreground, 0.7)` on 背景。Lighthouse a11y で確認）
- [ ] フォーカス時のリンクに視覚的な区別（`:focus-visible` で下線）が付く
- [ ] モバイル幅で折り返しが効き、レイアウト崩れしない
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

### Phase 7: ギフト体験の強化（進行中）

#### 7a ラッピング画像付きラジオ（2026-05-20）

テーマ側: `snippets/gift-options.liquid` に「ギフトラッピングを付ける」checkbox を残しつつ、その配下に 3 種ラジオ（シンプル / リボン付き / 箱入り）の入れ子 fieldset を追加。`assets/wrapping-simple.svg` / `wrapping-ribbon.svg` / `wrapping-box.svg` を装飾サムネとして配置。`assets/component-gift-options.css` に `.gift-options__radio-card` 系スタイルを追加（選択中の枠色強調、disabled の半透明化）。既存 JS の toggle を `data-gift-toggle` ベースの全件巡回に汎用化。admin 作業なし。

- [ ] PDP のギフトオプション内に「ギフトラッピングを付ける（無料）」checkbox が存在する（既存挙動を維持）
- [ ] checkbox を ON にすると、配下にラジオカード 3 種（シンプル / リボン付き / 箱入り）が表示される
- [ ] 各ラジオカードに 64×64 のサムネ SVG（包装紙 / リボン / 箱）が表示される
- [ ] 既定で「シンプル」が選択されている
- [ ] ラジオを切り替えると枠色が変わり、現在選択中が視覚的に分かる（`--color-button` の枠＋淡い影）
- [ ] checkbox OFF 時はラジオが `disabled` になり submit されない（半透明で操作不可表示）
- [ ] カートに追加 → カート画面の line item properties に `ギフトラッピング: シンプル`（または選んだスタイル）が表示される
- [ ] checkbox OFF のままカート追加 → `ギフトラッピング` プロパティは送信されない
- [ ] ギフトカード商品（`product.gift_card?`）には gift-options 自体が出ない（既存挙動を維持）
- [ ] モバイル幅（〜480px）でラジオが 1 列、タブレット以上で複数列にグリッドフロー
- [ ] ラジオラベル / サブテキストのコントラスト比が 4.5:1 以上
- [ ] `<fieldset><legend>` のセマンティックが付き、`:focus-visible` でフォーカスリングが見える
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

#### 7b メッセージカード文字数カウンター（2026-05-20）

テーマ側: `snippets/gift-options.liquid` のメッセージカード textarea 直下に `<p class="gift-options__counter" aria-live="polite">N / 100 字</p>` を追加。`data-gift-counter-input` / `data-gift-counter` 属性ベースで JS から監視し、入力ごとに残り字数を更新。`.gift-options__counter--warning` / `--limit` の 2 段階で色変更。`assets/component-gift-options.css` にスタイルを追加。

- [ ] メッセージカード textarea の直下に「0 / 100 字」が初期表示される
- [ ] 1 文字入力するごとにカウンターが「1 / 100」「2 / 100」と即時更新される
- [ ] 90 文字到達でカウンターが暖色（`#a45a14` アンバー）＋太字に切り替わる
- [ ] 100 文字到達でカウンターが赤系（`#b22a2a`）＋太字に切り替わる（textarea の `maxlength="100"` で物理的にも入力不可）
- [ ] 入力をクリアすると「0 / 100」に戻り、警告色も解除される
- [ ] カウンターのコントラスト比が 4.5:1 以上（warning / limit の両色とも背景に対して確認）
- [ ] スクリーンリーダーで `aria-live="polite"` により残り字数が読み上げられる（ただし高頻度更新で読み上げ干渉しないこと — 必要なら debounce 検討）
- [ ] 数字幅が tabular-nums で固定され、桁数変化でテキストがずれない
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

#### 7c 熨斗（のし）プレビュー（2026-05-20）

テーマ側: `snippets/gift-options.liquid` の熨斗 nested 内、用途 select と名入れ input の下に和紙風プレビューカードを追加。インライン SVG で紅白水引きを描画。用途・名入れ input に `data-noshi-purpose-input` / `data-noshi-name-input` を付け、JS で `change` / `input` イベントを購読して用途上段・名入れ下段の `<div>` をリアルタイム更新。既存 toggle 関数では値クリア時に synthetic event を発火させ、プレビューが連動して非表示になる仕組み。

- [ ] 熨斗チェックボックス OFF の初期状態ではプレビューカードが見えない（nested ごと `hidden`）
- [ ] 熨斗チェックボックス ON、用途・名入れともに未選択 / 未入力の状態ではプレビューカードが見えない（`data-noshi-preview` 自体が `hidden`）
- [ ] 用途を選択するとプレビューカードが現れ、上段に用途（例「御祝」）が表示される
- [ ] 名入れに文字を入力するとプレビューカードの下段にリアルタイムで反映される（1 文字ごとに更新）
- [ ] 用途・名入れの両方をクリアするとプレビューカードが自動的に隠れる
- [ ] 熨斗チェックボックスを OFF に戻すと、用途 select と名入れ input の値がクリアされ、プレビューカードも非表示になる
- [ ] プレビューカードは和紙風のクリーム背景＋二重枠線で、中央に紅白水引きの SVG が表示される（左右からのストランド + 中央の knot）
- [ ] 用途上段（1.8rem / 600 / letter-spacing 0.08em）と名入れ下段（1.5rem / letter-spacing 0.06em）でタイポグラフィの階層が分かる
- [ ] モバイル幅でプレビューカードがフォーム入力欄の下にレイアウト崩れせず収まる（grid-column: 1/-1 で全幅）
- [ ] スクリーンリーダーでは `aria-hidden="true"` によりプレビューカード内容は読まれない（フォーム入力欄が読み上げで十分なため装飾扱い）
- [ ] キャプション「プレビュー（イメージ）」は SR にも見え、ブロックの意図を伝える
- [ ] `shopify theme check` が baseline（2 errors / 9 warnings）を超えていない

---

## 公開前リハーサル（Phase 4 終盤）

### Bogus Gateway / テスト決済
- [ ] 設定 → 決済 → Bogus Gateway を有効化（または Shopify Payments のテストモード）
- [ ] テスト注文を1件流す（カード番号 `1` で成功）
- [ ] 受注メールが管理画面のメールアドレスに届く
- [ ] 注文管理画面で注文が見える
- [ ] テスト注文をキャンセル

### Theme Library での publish 動作
- [ ] Draft テーマで「プレビュー」リンクから動線確認
- [ ] 別端末（スマホ）でプレビューURLを開いて確認
- [ ] 公開前に Live テーマを複製してバックアップ
- [ ] 「公開」ボタンで Live と入替
- [ ] 何かあれば旧 Live を即時公開でロールバック

---

## 参考

- Shopify テスト注文: https://help.shopify.com/manual/checkout-settings/test-orders
- Bogus Gateway: https://help.shopify.com/manual/checkout-settings/test-orders/test-with-bogus-gateway
- Theme Library 操作: https://help.shopify.com/manual/online-store/themes/managing-themes
