# Lighthouse Baseline

Phase 完了ごとに `npm run lighthouse:capture -- --label phase-N` を実行し、`docs/lighthouse/phase-N/` 配下に JSON / HTML / Markdown サマリーを保存する運用。本ドキュメントはそのトップレベルの記録と所見（どこが課題で、なぜそのスコアなのか、Phase 4 でどう扱うか）をまとめる。

> **計測フローについて**: Shopify CLI のセッションが認証済みであれば、計測は **Claude Code セッションから完全自動で完走できる**（dev サーバーの background 起動 → 計測 → JSON/HTML/summary 読み取りまで Claude が担当）。手動操作が必要なのは **CLI トークンが期限切れになった初回の `shopify auth logout` → ブラウザ再ログインのみ**。詳細は [#再計測の運用](#再計測の運用) 参照。

## 計測条件

| 項目 | 値 |
|---|---|
| 計測ツール | Lighthouse 13.x（programmatic API） |
| 起動環境 | `shopify theme dev`（`http://127.0.0.1:9292`） |
| ブラウザ | Headless Chrome（`--headless=new`） |
| desktop throttling | rtt 40ms / 10240 kbps / CPU 1x |
| mobile throttling | rtt 150ms / 1638.4 kbps / CPU 4x（Lighthouse 既定の Slow 4G + Moto G4 想定） |
| カテゴリ | Performance / Accessibility / Best Practices / SEO |
| 計測ページ | `/` / `/products/strawberry-shortcake` / `/pages/delivery` / `/pages/faq` |

> ⚠️ **重要な前提**: 本計測は **`shopify theme dev` 経由のローカルプレビュー** に対するもの。本番（`*.myshopify.com` または独自ドメイン）では CDN・HTTP/2・画像最適化・キャッシュ等が効くため、特に Performance と Best Practices は本番のほうが高く出る。あくまで **テーマカスタマイズ起因の差分を相対比較する基準値** として扱う。

## phase-3 スコア（2026-05-11 計測）

詳細: [`docs/lighthouse/phase-3/summary.md`](./lighthouse/phase-3/summary.md)

### desktop

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| 01-home | **95** | **97** | 73 | 92 |
| 04-product-strawberry | 85 | 92 | **54** | **100** |
| 05-page-delivery | **97** | **97** | 73 | 92 |
| 06-page-faq | **96** | **97** | 73 | 92 |

### mobile

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| 01-home | 66 | **97** | 73 | 92 |
| 04-product-strawberry | **57** | 92 | 73 | **100** |
| 05-page-delivery | 77 | **97** | 73 | 92 |
| 06-page-faq | 89 | 96 | 73 | 92 |

## phase-4 スコア（2026-05-11 計測）

詳細: [`docs/lighthouse/phase-4/summary.md`](./lighthouse/phase-4/summary.md)。括弧内は phase-3 からの差分。Phase 4 の全変更（meta/OGP・PDP a11y・補助ページ見出し・LCP 画像 fetchpriority）反映後の最終 re-capture。

### desktop

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| 01-home | 96 (+1) | 97 | 73 | **100 (+8)** |
| 04-product-strawberry | 82 (−3) | **97 (+5)** | 54 | 100 |
| 05-page-delivery | 95 (−2) | 97 | 73 | **100 (+8)** |
| 06-page-faq | 91 (−5) | 97 | 73 | **100 (+8)** |

### mobile

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| 01-home | 73 (+7) | 97 | 73 | **100 (+8)** |
| 04-product-strawberry | 62 (+5) | **97 (+5)** | **73 (+0)** | 100 |
| 05-page-delivery | 72 (−5) | 97 | 73 | **100 (+8)** |
| 06-page-faq | 74 (−15) | 96 | 73 | **100 (+8)** |

> Performance の ± は **run 間のばらつき範囲**（dev サーバーは単一コネクション・CDN なし・未 minify のため `server-response-time` / `unminified-css` が支配的で、計測ごとに ±15 程度ぶれる）。Phase 4 で Performance を狙って下げた変更は無い。本番（CDN + HTTP/2 + minify）では大幅に改善する。a11y / SEO は Phase 4 の対象で、表のとおり実値が上がっている。

### phase-4 で動かした項目の結果

- **SEO 92 → 100（home / delivery / faq）** — `layout/theme.liquid` の `<meta name="description">` フォールバック（`page_description` → `settings.brand_description`）追加で `meta-description` 指摘が解消。OGP も `snippets/meta-tags.liquid` で `settings.brand_description` / `settings.brand_image` に fallback するよう拡張済み（`og:description` / `og:image`）。
- **PDP Accessibility 92 → 97（desktop / mobile とも）** — `color-contrast`（`.price__tax-suffix` / `.gift-options__optional` / `.delivery-date__optional` / `.delivery-date__note` を不透明度 0.6〜0.65 → 0.8）と数量入力の `aria-label` 追加で改善。残る −3 はフッターのニュースレター見出し / 入力欄が reveal-on-scroll の `opacity: 0.01` 待機状態でスナップショットされる**偽陽性**（[known-issues §9](./known-issues.md)）。実害なし。
- **補助ページの見出しレベルを整理** — phase-3 末で `main-page` の h1（ページタイトル）と先頭セクション見出しが二重になっていた問題を直した際、`page.delivery` の info_grid multicolumn の `title` を空にしたら h1（ページタイトル）→ h3（列見出し）の**見出しレベル飛び**が発生し `heading-order` で a11y −2（delivery 97→95）になっていた。`title` を「配送について」に変更して h1→h2→h3 に修正（a11y 97 に復帰）。`page.legal` 末尾の「本ページについて」も h3→h2 に上げて h1→h3 飛びを解消（Lighthouse 計測対象外だが同様に修正）。
- **Best Practices 73 / PDP 54 は据え置き** — 内訳が `third-party-cookies`（Shop Pay の `_shop_app_essential` cookie）/ `errors-in-console`・`inspector-issues`（`shop.app` iframe の CSP 違反）/ `deprecations`（`overflow: visible` on img/video/canvas — Dawn/Rise 共通の Chrome 将来仕様警告）で、いずれも **Shopify プラットフォーム側 or `theme dev`（http）固有でテーマからは改善不可**。known-issues に既知の制約として記録（[§10](./known-issues.md)）。
- **PDP メイン商品画像に `loading="eager"` + `fetchpriority="high"`** — `snippets/product-thumbnail.liquid` を Dawn 現行版の挙動に合わせ、ギャラリー先頭（非 lazy）の画像だけ eager / high priority、それ以外は lazy / auto。Lighthouse の「`fetchpriority=high` should be applied」ヒント（LCP 画像）が解消（rendered HTML で確認済み）。Performance スコア自体は dev サーバーのばらつきに埋もれて明確な差は出ていないが、本番では LCP がわずかに前倒しになる想定。`<link rel="preload">` までは入れていない（Dawn も標準では入れない）。

## 所見と Phase 4 での扱い

### 1. Best Practices が全ページ 73 / PDP は 54

**原因（Lighthouse の audit 内訳より）**:
- `third-party-cookies` — Shopify CDN / 決済まわりの 3rd party cookie 警告。本番でも残るが、Shopify のプラットフォーム仕様であり**テーマ側で対応不可**。
- `errors-in-console` — `shopify theme dev` の HMR / dev-server 起因のコンソールエラー（hot reload socket 接続など）。**本番では発生しない**。
- `inspector-issues` — Chrome DevTools の Issues タブに記録される警告（同上、dev 環境固有のもの含む）。
- PDP のみ `deprecations` も hit → variant picker / quantity / お届け日ピッカー周辺の deprecated DOM API 使用を確認すべき。

**Phase 4 での扱い**:
- 73 → 大半は dev サーバー起因なので**改善対象外**として記録する（本番計測時に再評価）。
- **PDP の 54** は `deprecations` の中身を Phase 4 で確認し、修正可能なら対応する（PDP 固有の deprecated API 使用が候補）。

### 2. PDP のモバイル Performance が 57

**主要メトリクス（mobile）**:
- LCP: **9.6s**（目標 ≤ 2.5s）
- FCP: 6.3s
- TTI: 14.2s
- TBT: 167ms（許容範囲）
- CLS: 0（良好）

**改善余地（savings opportunities）**:
| audit | 削減見込み | コメント |
|---|---:|---|
| `unused-javascript` | 1730ms | Rise 由来の JS バンドルに未使用領域あり |
| `server-response-time` | 798ms | dev サーバー応答（本番 CDN では改善見込み） |
| `unused-css-rules` | 560ms | Rise の component CSS に未使用 |
| `unminified-css` | 150ms | dev サーバーは未 minify、本番では minify される |

**Phase 4 での扱い**:
- `server-response-time` と `unminified-css` は **dev サーバー固有**なので本番では大きく改善する見込み。
- `unused-javascript` / `unused-css-rules` は Rise theme のバンドル設計起因。**Rise を魔改造する範囲外**として記録のみとし、Phase 4 では手を入れない（学習用デモのため）。
- LCP が大きいのは PDP のメイン商品画像とギャラリーが原因。→ Phase 4 で `snippets/product-thumbnail.liquid` のギャラリー先頭画像に `loading="eager"` + `fetchpriority="high"` を付与（対応済み）。`<link rel="preload">` までは入れていない（Dawn も標準では入れない）。

### 3. ホーム mobile Performance 66

PDP と同様の構造的問題（unused CSS/JS + dev サーバー応答）に加え、ヒーロー画像の LCP（11s）が支配的。本番では CDN + WebP / responsive image で大幅改善見込み。

### 4. SEO 92（PDP のみ 100）

唯一の指摘: **`meta-description` が無い**（ホーム / お届け / FAQ）。

**Phase 4 での扱い**: 
- PDP は商品 description から自動生成されるため 100。
- ホーム / 補助ページは `templates/*.json` の SEO 設定または `theme.liquid` の `<meta name="description">` 出力で対応可能。**Phase 4 で着手**。

### 5. Accessibility 92（PDP のみ）

PDP の指摘:
- `color-contrast` — タグベースバッジ（新商品 / 季節限定 / 人気）または価格表記の配色が WCAG AA 未達。
- `label` — フォーム要素（数量入力 / 日付選択など）に `<label>` が紐づいていない箇所あり。

**Phase 4 での扱い**: **要対応**。アクセシビリティは学習用途でも見せ場なので、Phase 4 で個別 audit を確認しながら直す。

## Phase 4 アクションサマリー

| # | 対象 | 優先度 | 状態 |
|---|---|---|---|
| 1 | PDP `color-contrast` / `label` 修正 | High | ✅ 完了（a11y 92→97） |
| 2 | ホーム / 補助ページに meta description 追加 | High | ✅ 完了（SEO 92→100、OGP fallback も追加） |
| 3 | PDP `deprecations` 中身確認 | Medium | ✅ 確認済 → Shopify 側 or dev 固有のため対応不可、known-issues §10 に記録 |
| 4 | PDP メイン画像の `fetchpriority="high"` 検討 | Medium | ✅ 完了（`product-thumbnail.liquid`：先頭画像 `loading="eager"` + `fetchpriority="high"`、Lighthouse の LCP ヒント解消） |
| 5 | Rise 由来 unused CSS/JS 削減 | Low（範囲外） | スキップ（学習用デモ） |
| 6 | dev サーバー固有警告 | スキップ | — |

## 再計測の運用

### Claude Code セッションから自動実行する場合（推奨）

Phase 4 着手中の改善ごとに、Claude に「Lighthouse 再計測して」と依頼すれば以下を自動で回せる。

1. `shopify theme dev` を background プロセスで起動（`Bash` の `run_in_background`）
2. dev サーバー起動完了を待機（`Monitor` で stdout の "Theme is ready" 等を待つ）
3. `npm run lighthouse:capture -- --label phase-N` 実行
4. `docs/lighthouse/phase-N/summary.md` と各ページ HTML を読み、phase-3 との差分を要約
5. dev サーバープロセスを停止

**前提**: Shopify CLI のセッションが認証済み（`shopify auth logout` 直後でない、トークン期限切れでない）。トークン期限切れの場合は user に再ログインを依頼する。

### 手動実行する場合

```bash
# 別ターミナルで dev サーバーを起動
shopify theme dev --store sweet-atelier-demo.myshopify.com

# 計測
npm run lighthouse:capture -- --label phase-4
```

### Phase 4 クロージング

`docs/lighthouse/phase-3` と `docs/lighthouse/phase-4` の summary を比較し、本ドキュメントに「phase-4 スコア」セクションを追記する。
