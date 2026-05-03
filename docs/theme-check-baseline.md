# Theme Check Baseline

Rise 15.4.1（baseline commit [`b10336b`](https://github.com/meta-taro/shopify-cake-store-demo-theme/commit/b10336b)）の `shopify theme check` 結果を記録したもの。Phase 2 以降のカスタマイズで「自分が増やした警告」と「Rise 由来の警告」を切り分けるための基準値。

## Baseline (2026-05-01)

```
166 files inspected with 11 total offenses found across 8 files.
2 errors.
9 warnings.
```

すべて **Rise 純正のまま**で発生。本リポジトリのカスタマイズによるものは含まれない。

### Errors (2)

| ファイル | ルール | 内容 |
|---|---|---|
| `sections/featured-product.liquid:743` | `ValidSchemaTranslations` | `t:sections.main-product.blocks.icon_with_text.settings.content.label` が `locales/en.default.schema.json` に未定義 |
| `sections/featured-product.liquid:744` | `ValidSchemaTranslations` | 同上 `.info` キー |

→ Rise 15.4.1 の同梱漏れ（テーマ側のバグ）。修正方針が固まるまでは触らない。

### Warnings (9)

| ファイル | 行 | ルール | 内容 | 評価 |
|---|---|---|---|---|
| `layout/password.liquid` | 40 | `UndefinedObject` | `scheme_classes` 不明 | **誤検出**（累積assignパターンを追えていない） |
| `layout/theme.liquid` | 58 | `UndefinedObject` | `scheme_classes` 不明 | **誤検出**（同上） |
| `sections/featured-product.liquid` | 490 | `UnusedAssign` | `seo_media` 未使用 | Rise の取り残し |
| `sections/main-article.liquid` | 102 | `VariableName` | `anchorId` が camelCase | Rise の規約違反 |
| `sections/main-list-collections.liquid` | 20 | `VariableName` | `moduloResult` が camelCase | Rise の規約違反 |
| `sections/main-product.liquid` | 731 | `UnusedAssign` | `seo_media` 未使用 | Rise の取り残し |
| `sections/main-product.liquid` | 587 | `UndefinedObject` | `continue` 不明 | **誤検出**（`paginate` の `continue` は Liquid 公式キーワード） |
| `sections/main-search.liquid` | 274 | `UnusedAssign` | `product_settings` 未使用 | Rise の取り残し |
| `snippets/quick-order-product-row.liquid` | 1 | `OrphanedSnippet` | どこからも参照されない | Rise の B2B 用スニペット。本プロジェクトでは未使用 |

## Phase 1 完了時 (2026-05-03)

```
168 files inspected with 11 total offenses found across 8 files.
2 errors.
9 warnings.
```

- 検査ファイル数: 168（baseline: 166、+2 は `package.json` / `scripts/capture-screenshots.mjs` の追加分）
- offense 合計: 11（baseline と同じ顔ぶれ）
- baseline からの増減: ±0
- 新規追加分（自分起因）: なし

→ Phase 1 はストア設定・商品/コレクション登録・ロケール調整中心で、Liquid/CSS/JS の改変はゼロ。差分が出ないのが期待通り。

## 運用ルール

- **Phase 完了ごと**に `shopify theme check` を再実行し、件数を比較する
- 増えた offense は基本的に「自分のカスタマイズ起因」とみなし、修正対象とする
- 上記 baseline に含まれる項目は当面そのまま放置（Rise 本体の更新で改善される可能性があるため）
- Rise を新バージョンに更新したらこのファイルも更新する

## 比較用テンプレート

新しい結果を貼るとき:

```
Phase X 完了時 (YYYY-MM-DD)
- 検査ファイル数: N
- offense 合計: N (errors: N / warnings: N)
- baseline からの増減: +N / -N
- 新規追加分（自分起因）:
  - file:line - rule - 内容
```

## 参考

- 公式: https://shopify.dev/docs/themes/tools/theme-check
- ルール一覧: https://shopify.dev/docs/themes/tools/theme-check/checks
