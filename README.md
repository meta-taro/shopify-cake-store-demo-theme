# shopify-cake-store-demo-theme

[![Shopify](https://img.shields.io/badge/Shopify-Online_Store_2.0-95BF47?logo=shopify&logoColor=white)](https://shopify.dev/docs/themes)
[![Theme Base](https://img.shields.io/badge/Base-Rise-7AB55C?logo=shopify&logoColor=white)](https://themes.shopify.com/themes/rise)
[![Liquid](https://img.shields.io/badge/Liquid-template-2196F3?logo=shopify&logoColor=white)](https://shopify.dev/docs/api/liquid)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Shopify CLI](https://img.shields.io/badge/Shopify_CLI-3.x-5E8E3E?logo=shopify&logoColor=white)](https://shopify.dev/docs/themes/tools/cli)
[![Status](https://img.shields.io/badge/status-Phase_4_complete-brightgreen.svg)](#roadmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Shopify Online Store 2.0 のテーマ開発を学ぶためのデモプロジェクト。架空のケーキ・スイーツEC「**Sweet Atelier**」向けに、Shopify 公式テーマ **Rise** をベースとしてカスタマイズしていく学習用テーマです。

> 実在のサイト・ブランド・商品名・画像・文章は使用していません。すべてオリジナルのデモコンテンツで構築します。

## Live Demo

実装中のデモストアで実機動作をご確認いただけます。

- **URL**: <https://sweet-atelier-demo.myshopify.com/>
- **ストアパスワード**: `recamp`

> 閲覧専用のデモストアです。実際の購入はできません。Shopify 開発ストアのため、長期間アクセスがないと inactive 扱いになる場合があります。

## Tech Stack

- Shopify Online Store 2.0
- Liquid
- JSON templates
- Sections / Snippets
- CSS（Sass は任意）
- JavaScript（Vanilla, ES6+）
- Shopify CLI 3.x
- Node.js 22 LTS

## Prerequisites

- [Node.js 22+](https://nodejs.org/)（`.nvmrc` でバージョン固定済み）
- npm 10+
- [Shopify CLI 3.x](https://shopify.dev/docs/themes/tools/cli)
- [Shopify Partners](https://www.shopify.com/jp/partners) アカウント＋開発ストア

## Setup

### 1. クローン

```bash
git clone https://github.com/meta-taro/shopify-cake-store-demo-theme.git
cd shopify-cake-store-demo-theme
```

### 2. Node.js バージョンを適用

```bash
fnm use      # fnm 利用者
# または
nvm use      # nvm 利用者
```

### 3. Shopify CLI をインストール

```bash
npm install -g @shopify/cli@latest
shopify version    # 3.x が表示されればOK
```

### 4. 開発ストアと接続

`{YOUR_STORE}` をご自身の開発ストア URL（例: `xxxxx.myshopify.com`）に置き換えて実行します。

```bash
shopify theme dev --store {YOUR_STORE}.myshopify.com
```

初回はブラウザが開いて Shopify の認証フローが走ります。完了後、`http://127.0.0.1:9292` でローカルプレビューできます。ファイル保存で自動リロードされます。

## Daily Workflow / 再開手順

### 普段の開発

1. ターミナルで dev サーバー起動: `shopify theme dev --store sweet-atelier-demo.myshopify.com`
2. ブラウザで `http://127.0.0.1:9292/` を開く
3. ファイル編集 → 自動リロード
4. 終了は `Ctrl+C`

### PC 再起動後・dev サーバーが落ちた後の復旧

`http://127.0.0.1:9292/` にアクセスできなくなったら、dev サーバーが停止しているだけ。再起動するだけで戻ります。

```bash
shopify theme dev --store sweet-atelier-demo.myshopify.com
```

### 「The access token provided is expired」エラーが出たら

長時間放置（数日〜）後によく出る CLI トークン期限切れ。再認証で復旧します。

```bash
shopify auth logout
shopify theme dev --store sweet-atelier-demo.myshopify.com
```

ブラウザが開いて Shopify の認証フローが走るので、再ログイン → 完了後に dev サーバーが起動します。詳細は [`docs/known-issues.md` §8](./docs/known-issues.md#8-shopify-cli-トークンの期限切れ)。

### live テーマへの反映（admin で見えるテンプレート更新等）

`theme dev` は一時プレビュー専用。**admin のテンプレート一覧や本番ストアに反映するには明示的に push が必要**。

```bash
shopify theme push --theme=156264464583  # live (Rise) の theme id
```

> ⚠️ プロンプトで「Create a new theme」を Yes にすると意図せず別テーマが作られます。`--theme=<id>` 指定が安全。詳細は [`docs/known-issues.md` §7](./docs/known-issues.md#7-shopify-theme-pull-がローカル変更を上書きする) も参照。

---

## Commands

| コマンド | 用途 |
|---|---|
| `shopify theme dev --store {STORE}.myshopify.com` | ローカル開発サーバー起動（HMR付き） |
| `shopify theme push` | ローカル → ストアへ反映 |
| `shopify theme pull` | ストア → ローカルへ取得 |
| `shopify theme list` | ストアにあるテーマ一覧 |
| `shopify theme check` | テーマのリンター実行 |
| `npm run screenshot:baseline` | ローカル dev サーバーから Phase 比較用スクリーンショット取得（[詳細](./docs/screenshots/README.md)） |
| `npm run lighthouse:capture -- --label phase-N` | ローカル dev サーバーに対し Lighthouse 計測（[ベースライン](./docs/lighthouse-baseline.md)） |

## Directory Structure

```
.
├── assets/          # CSS, JS, SVG, 画像, フォント
├── config/          # settings_schema.json, settings_data.json
├── layout/          # theme.liquid, password.liquid
├── locales/         # 翻訳 JSON（ja.json, en.default.json 等）
├── sections/        # セクション Liquid
├── snippets/        # スニペット Liquid
└── templates/       # JSON テンプレート（および .liquid オーバーライド）
```

## Conventions

ファイル命名は Rise / Dawn の慣習を踏襲します。すべて **kebab-case**。

### `sections/`

| プレフィックス | 用途 | 例 |
|---|---|---|
| `main-*` | テンプレートのメイン領域専用セクション | `main-product`, `main-cart-items`, `main-collection-product-grid` |
| `featured-*` | ホーム等の訴求枠 | `featured-collection`, `featured-product`, `featured-blog` |
| `cart-*` | カート関連 | `cart-drawer`, `cart-notification-product` |
| (機能名) | 汎用セクション | `image-banner`, `multicolumn`, `slideshow`, `header`, `footer` |

### `snippets/`

| プレフィックス | 用途 | 例 |
|---|---|---|
| `card-*` | カード型UI部品 | `card-product`, `card-collection`, `article-card` |
| `icon-*` | アイコン | `icon-accordion` |
| `header-*` | ヘッダー部品 | `header-mega-menu`, `header-search`, `header-drawer` |
| `product-*` | 商品関連 | `product-media`, `product-variant-picker`, `product-thumbnail` |
| (機能名) | 汎用スニペット | `pagination`, `price`, `meta-tags` |

### `assets/`

| プレフィックス | 用途 |
|---|---|
| `component-*.css` | 再利用 CSS コンポーネント（例: `component-card.css`, `component-cart-drawer.css`） |
| `section-*.css` | セクション固有 CSS（例: `section-main-product.css`） |
| `template-*.css` | テンプレート固有 CSS（例: `template-collection.css`） |
| `icon-*.svg` | アイコン SVG |
| (機能名).js | JavaScript モジュール（例: `cart.js`, `product-form.js`） |

### コード規約

- **CSS クラス**: BEM ライク（`.product-card__title`, `.hero-banner--fullwidth`）
- **JavaScript**: モジュール単位で `assets/` に配置、Vanilla JS (ES6+)
- **Liquid 変数**: snake_case（`product_title`, `featured_collection`）
- **新規セクション/スニペット作成時**: 上記プレフィックス慣習に従う。判断に迷う場合は機能ベース命名でOK

## Cross-Platform Notes

- 開発環境: Windows（Bash / PowerShell）と macOS の双方で開発可能
- 行末コード: `.gitattributes` により LF に統一
- `shopify.theme.toml` は環境ごとに異なるため `.gitignore` 対象（ストアURL・テーマIDが含まれる）
- Shopify CLI と認証は環境ごとに別途必要

## Roadmap

- [x] **Phase 0** — 環境構築 / Rise theme baseline（2026-05-01 完了）
- [x] **Phase 1** — ストア設定・ダミーコンテンツ（ブランド設定 / 商品 5 件 / コレクション 5 件 / 日本語化）（2026-05-03 完了）
- [x] **Phase 2** — トップページカスタマイズ（ヒーロー / 定番のケーキ / コレクションリスト / キャンペーン / ブランド紹介 / レビュークーポン）（2026-05-07 完了）
- [x] **Phase 3** — 商品詳細・カートUX・補助ページ（2026-05-11 完了）
  - [x] 3a PDP 基本拡張（タブ × 5 / 信頼バッジ / 関連商品）
  - [x] 3b バリアント・サイズ選択 UI
  - [x] 3c ギフトオプション（熨斗 / メッセージカード / ラッピング、line item properties）
  - [x] 3d お届け日ピッカー（最短 3 営業日後 / 水曜定休除外 / 時間帯選択）
  - [x] 3e 商品カード強化（タグベースバッジ "新商品 / 季節限定 / 人気" + 税込表記）
  - [x] 3f 補助ページ（お届けについて / FAQ / 特定商取引法 / アトリエのご案内 — 4 テンプレート + admin 手順書）
  - [x] 3g（アレルゲン構造化データは Phase 5a に統合）
- [x] **Phase 4** — 仕上げ・公開準備（2026-05-11 完了）
  - [x] meta description / OGP（`page_description` → `settings.brand_description` フォールバック、`og:image` は `settings.brand_image` にフォールバック）
  - [x] PDP アクセシビリティ（税込 suffix / ギフト・お届け日の注記の `color-contrast`、数量入力の `aria-label`）
  - [x] 補助ページの見出しレベル整理（`<h1>` 重複の解消 + `heading-order` 維持）
  - [x] PDP メイン商品画像に `loading="eager"` + `fetchpriority="high"`（LCP 前倒し）
  - [x] スクリーンショット撮影方法の改善（reveal-on-scroll を `reducedMotion: "reduce"` で無効化し全セクションを最終状態でキャプチャ）
  - [x] Lighthouse 計測（[`docs/lighthouse-baseline.md`](./docs/lighthouse-baseline.md)：SEO 92→100、PDP a11y 92→97）
  - [x] 公開リハーサル（live テーマへの `theme push` / Bogus Gateway テスト注文 #1001 / `money_with_currency_format` 整理 / 不要テーマ削除）
  - [x] アトリエのご案内ページに店舗外観画像（`11-store-exterior.png`）、特商法ページの事業者名を架空名に統一（2026-05-12）

### 提案機能ショーケース ロードマップ（Phase 5 以降・順次着手）

各 Phase はサブステップ（5a, 5b…）に分割し、1 つずつ commit → スクショ Before/After → README / `docs/qa-checklist.md` 更新で進める。

- [x] **Phase 5** — 商品情報の充実
  - [x] 5a アレルゲン表示（Shopify 標準「アレルゲン情報」カテゴリーメタフィールドを読み取り、PDP「アレルゲン情報」行に構造化テーブル表示〔区分はテーマ側で食品表示法 8 特定原材料から自動判定〕。任意の `custom.allergen_contamination` でコンタミ注記、商品カード小バッジ「アレルゲン情報あり」。コレクション/検索の絞り込みは admin の「検索と発見」アプリ側設定で任意）
  - [x] 5b 号数早見表（PDP「サイズの目安」行に号数 / 直径 / 目安人数の早見表。「サイズ」バリエーションがある商品は該当号数の行を強調〔該当号数の行に「この商品で選べます」バッジ〕。admin 作業なし）
  - [x] 5c 季節商品の販売期間バッジ + カウントダウン（custom.sale_start / sale_end 日付メタフィールドを読み、PDP に「販売は MM/DD まで・残り N 日」バナー〔残り日数 ≤ 7 日で暖色に強調〕、商品カードバッジに残り日数を併記、`/collections/seasonal` 上部に「販売中の季節商品」リスト。期間外は自動で非表示／優先度フォールバック）
- [x] **Phase 6** — SEO・構造化データ仕上げ
  - [x] 6a `FAQPage` JSON-LD（FAQ ページ：視覚 UI 用の collapsible-content と並走する非表示セクション `faq-jsonld` を追加。Q&A 内容は theme editor 内で 2 セクション分を手動同期する運用）
  - [x] 6b `BreadcrumbList` JSON-LD + パンくず UI（`snippets/breadcrumb.liquid` + `assets/component-breadcrumb.css` で視覚 UI と JSON-LD を同居生成。商品 / コレクション / page テンプレートの `main-*` セクションから render。collection に置かれた商品では中間階層も自動追加）
- [x] **Phase 7** — ギフト体験の強化
  - [x] 7a ラッピング画像付きラジオ（`snippets/gift-options.liquid` の「ギフトラッピングを付ける」checkbox に、シンプル / リボン付き / 箱入りの 3 種ラジオを入れ子で追加。`assets/wrapping-*.svg` の装飾サムネ付きラジオカード UI。熨斗と同じ data-gift-toggle / data-gift-nested 機構で disable 連動）
  - [x] 7b メッセージカード文字数カウンター（textarea 直下にライブ「N / 100 字」カウンター、`aria-live="polite"`、90字到達でアンバー警告、100字到達で赤系強調）
  - [x] 7c 熨斗（のし）プレビュー（用途・名入れ入力に連動して、和紙風カードに用途上段／紅白水引き SVG／名入れ下段の体裁でリアルタイム表示。両方未入力時は非表示、checkbox オフ時は入力クリア＋プレビューも自動的に隠れる。`aria-hidden` で SR には冗長読み上げを避ける装飾扱い）
- [x] **Phase 8** — 検索・フィルター・並べ替え（Shopify Search & Discovery 連携）
  - [x] 8a faceted filtering（在庫状況 / 価格 / タグ〔おすすめ〕/ サイズ / アレルゲン）。フィルターは「検索と発見」アプリで制御し、テーマの `snippets/facets.liquid` が汎用描画（コード追加なし）。バッジ用タグを英語（new/popular/seasonal）→日本語（人気/季節限定/新商品）に変更し、タグ絞り込みに英語が出る問題を解消（`card-product-extra-badge.liquid` の判定も追従）
  - [x] 8b ソート（`templates/collection.json` / `search.json` で `enable_sorting: true`）＋検索結果ページの絞り込み（horizontal）。admin 手順は `docs/admin-setup.md §11`
- [ ] **Phase 9** — 回遊・パーソナライズ（フロントエンドのみ・アプリ不要）
  - [ ] 9a 最近見た商品（localStorage）
  - [ ] 9b ウィッシュリスト（localStorage）
  - [ ] 9c 送料シミュレーター（都道府県選択 → 送料表示）
- [ ] **Phase 10** — コンテンツ（ブログ / コラム）
  - [ ] 10a blog テンプレート一式（季節の素材 / レシピ / お知らせ）
  - [ ] 10b 関連記事 + 記事内商品リンク
- [ ] **Phase 11** — 店舗受け取り・お客様の声
  - [ ] 11a local pickup 導線（Shopify 標準機能 + テーマ表示）
  - [ ] 11b お客様の声セクション（メタオブジェクトのダミーレビュー。※本番のレビュー収集はアプリ前提と注記）
- [ ] **Phase 12** — 多言語・通貨
  - [ ] 12a en ロケール整備
  - [ ] 12b language / currency switcher の実用化（現状フッターに設置のみ）
- [ ] **Phase 13** — 顧客アカウント
  - [ ] 13a 注文履歴 / 再注文 / お気に入り
- [ ] **Phase 14** — アクセシビリティ・パフォーマンス 第 2 弾
  - [ ] 14a Lighthouse さらなる作り込み / 画像最適化 / CLS 対策
- [ ] **Phase 15** — 再入荷通知（テーマ + Shopify Flow 連携）
  - [ ] 15a 在庫切れ PDP に「再入荷したらメールでお知らせ」フォーム設置（テーマ実装。Contact Form 流用 or customer メタフィールド経由）
  - [ ] 15b Shopify Flow で在庫復活トリガー → 通知メール自動送信を組む手順を `docs/admin-setup.md` に追記
- [ ] **Phase 16** — スプレッドシートでの商品一括登録（CSV import/export 実務体験）
  - [ ] 16a Shopify 標準 CSV エクスポート（既存 5 商品）→ Google Sheets で編集 → 再 import の往復を実践
  - [ ] 16b 落とし穴の検証と回避策（variants/images/metafields の列順、SJIS エンコーディング、画像 URL 重複、価格と税表記、import 中断時の挙動など）を `docs/spreadsheet-product-ops.md` に整理
  - [ ] 16c サンプル CSV（本リポの商品 5 件分）を `docs/samples/` 同梱
  - [ ] ※ 受注案件 5d（クライアント固有運用・非公開）とは目的が独立。本 Phase は公開可能な汎用知識

各フェーズのスクリーンショット差分は [`docs/screenshots/`](./docs/screenshots/) で `baseline → phase-1 → phase-2 → phase-3 → phase-4 → …` の順に確認できます。

## Beyond This Repo — さらなる学習の発展とビジネスへの展開

このリポジトリは「Shopify テーマ開発の学習＋スキルを見せるためのポートフォリオ」が目的で、Rise theme の派生物（＝そのまま販売はできない）です。ここから先、学習を発展させてビジネスにつなげるなら次のような道筋があります（本リポジトリでは扱わない、構想メモ）。

### 1. Shopify App を作って公式公開（開発者ブランディング向き）
- **何を作る**: 外部ホストの Web アプリ（Node / Rails 等）が Shopify の各種 API（Admin API / Storefront API）を叩く構成。管理画面に画面を足す（App Bridge + Polaris）か、ストアフロントにウィジェットを足す（**Theme App Extension / App Block / App Embed** — テーマのコードを直接いじらず機能を載せる現行推奨の仕組み）か、Webhook / Shopify Functions / Checkout UI Extensions で裏側に介入するか。
- **狙い目**: いきなり大型アプリは審査・保守・競合で消耗するので、**小さく実在のニッチ**から。例：このデモで line item properties として実装した「のし・ラッピング指定」「お届け日時指定の高機能版」のような日本市場向け機能。
- **配布**: Shopify App Store（審査あり）。課金は Shopify の Billing API に乗せられる（年商 100万ドルまでレベニューシェア 0%）。
- **宣伝商材化**: App Store リスティング（マーチャント向け）＋ **Zenn / Qiita 記事**（「Shopify アプリを公式公開するまで」「Theme App Extension でウィジェットを作る」系は読まれやすい。1 本完結より企画→実装→審査→運用で複数本に分割）＋デモ動画＋（任意で）公開リポジトリ。公開する場合は `client_secret` / API キー / Webhook 署名シークレットを絶対にコミットしない（`.env` を gitignore、`.env.example` を置く）。Shopify の API 利用規約・ブランドガイドライン（アプリ名に "Shopify" を含めない等）を遵守。

### 2. 販売用テーマを ThemeForest / Shopify Theme Store へ（このリポジトリとは別物）
- ⚠️ **本リポジトリのテーマは Rise の派生なので販売不可**。販売用テーマは**新規プロジェクトとしてゼロから（またはライセンスがクリーンなベースから）**起こす必要がある。本リポジトリで身につけた Liquid / セクション設計のスキルを、クリーンな新規テーマに活かす形。
- **ThemeForest（Envato）**: 審査のハードルが比較的低く「登録して様子見」がしやすい。マーケットプレイス自体に集客力あり。単価は安め。まず需要を測る入口に向く。
- **Shopify Theme Store**: 参入障壁は高い（掲載テーマ数は世界で 100〜200 程度、品質・パフォーマンス・サポート体制まで審査、レベニューシェア＋独占販売＋継続メンテ義務）が、入れれば Shopify 本体が集客してくれるので外部マーケ最小で売れる“本命”。ThemeForest で手応えを得てから挑戦するルートが現実的。

### 3. 受託・コンサル（学習リポジトリをそのまま営業資料に）
- このリポジトリ＋スクリーンショット＋（作るなら）`docs/feature-matrix.md` を「標準テーマカスタマイズでここまでできます」の実物デモとして使う。提案では「テーマカスタマイズで完結すること」と「アプリ追加が前提のこと（レビュー本格運用・サブスク・複雑な在庫連携など）」を切り分けると話が通りやすい。
- ライブデモは開発ストア（提案時だけパスワード共有 or 一時解除）で見せる。

### 4. AEO / LLMO（AI 経由の流入・購入への対応）
- Shopify はプラットフォーム側で `llms.txt` / `agents.md` / UCP（Universal Commerce Protocol）の入口を**自動配信**しており、Shopify ストアは AI コマースの最低要件を勝手に満たしている（テーマ側の作業は基本不要。`templates/llms.txt.liquid` を置けば中身をカスタマイズ可）。
- 確実に効くのは従来からの**構造化データ（JSON-LD / schema.org）**。Phase 6（SEO・構造化データ）で `FAQPage` / `BreadcrumbList` を入れる予定。「構造化データをちゃんとやる＋ついでに llms.txt も置く」が AEO/LLMO 実務の定石。

> 上記はいずれも本リポジトリのスコープ外。Phase 5〜14（上記ロードマップ）を一通り終えたあとの発展方向のメモ。

## Credits

このテーマは Shopify 公式の **[Rise theme](https://themes.shopify.com/themes/rise)** をベースとして派生したものです。元テーマの著作権・ライセンスは Shopify Inc. に帰属します。本リポジトリで公開しているカスタマイズ部分は学習用の派生物であり、Rise theme の利用規約に従って使用してください。

### Baseline 情報

| 項目 | 値 |
|---|---|
| Theme name | Rise |
| Theme version | **15.4.1** |
| Author | Shopify |
| Pull date | 2026-04-30 |
| Baseline commit | [`b10336b`](https://github.com/meta-taro/shopify-cake-store-demo-theme/commit/b10336b) |
| Source | 開発ストアにプリインストールされていた live theme を `shopify theme pull` で取得 |

> Rise 本体が更新された場合は、新規ブランチで `shopify theme pull --new-store` 後、`b10336b` との diff を取って手動マージ判断する想定。

baseline 時点での `shopify theme check` 結果（自分のカスタマイズと Rise 由来の offense を切り分けるための基準値）は [`docs/theme-check-baseline.md`](./docs/theme-check-baseline.md) に記録。公開前の手動QAチェックリストは [`docs/qa-checklist.md`](./docs/qa-checklist.md)（Phase 完了ごとに育てる Living checklist）。意図的に対応していない既知問題と Rise ベースライン由来の制約は [`docs/known-issues.md`](./docs/known-issues.md) に集約。Lighthouse 計測のベースラインと所見は [`docs/lighthouse-baseline.md`](./docs/lighthouse-baseline.md) に記録（`npm run lighthouse:capture` で再計測可）。

## License

[MIT](LICENSE) — 本リポジトリでカスタマイズした部分のみを対象とします。
