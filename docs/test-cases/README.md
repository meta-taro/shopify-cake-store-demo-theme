# Test Cases / テスト項目書

手動テスト用の **テスト項目書（テストケース仕様）** を AI が生成し、人間が実施する仕組み。
このディレクトリの Markdown が **正本（source of truth）**で、実行は GitHub Issue 上で行う。

> このリポジトリは学習・ポートフォリオ用の公開デモテーマ。テスト項目書そのものも
> 「標準テーマカスタマイズをどう検証するか」を示す成果物として公開する。

## なぜこの構成か

| レイヤー | 置き場所 | 役割 |
|---|---|---|
| 正本（spec） | `docs/test-cases/phase-N.md`（このディレクトリ） | ID 付きテストケース。git 管理＝diff・PR レビュー・ブランチ連動 |
| 証跡（画像） | `docs/screenshots/<label>/...`（コミット済み PNG） | Playwright キャプチャを raw URL で Issue に埋込 |
| 実行票 | GitHub Issue（label `test`） | 人がチェック・コメント。不合格は `bug` 子 Issue |
| 監査 | `gh issue list/view`（AI エージェント） | 未消化項目の要約・コミットとの突合 |
| 改善ルール | [`improvement-rules.md`](./improvement-rules.md) | 検証中に見つけた知見を蓄積し次の項目書に反映 |

Issue 単独だと「リッチな表に弱い」「履歴スナップショットが残らない」が、正本を
リポジトリに置くことで解消する。画像はコミットに紐づくので「その commit 時点の
期待画面」として凍結された証跡になる。

## ワークフロー

```
1. AI が code 変更内容 + qa-checklist.md から phase-N.md を生成/更新（正本）
2. 必要なスクショを撮影しコミット（pnpm run screenshot:baseline -- --label phase-N）
3. AI が gh issue create で「[Test] Phase N」を起票（チェックリスト＋スクショ raw URL）
4. 人がテスト実施 → チェック・コメント記入。不合格は bug 子 Issue を起票
5. AI が gh issue list/view で未消化を監査・要約
6. 検証で得た知見を improvement-rules.md に追記 → 次の phase 項目書へ反映
```

## ID 採番ルール

`TC-{phase}{sub}-{nn}`

- `TC-9A-01` … Phase 9 / サブ a（最近見た商品）/ 通し番号 01
- 共通動線は `TC-COMMON-01` のように `COMMON` を使う
- 一度振った ID は再利用しない（追跡可能性のため）

## 優先度

| 優先度 | 意味 |
|---|---|
| P1 | 主要動線・公開前に必須（壊れたら出せない） |
| P2 | 重要だが代替/回避あり |
| P3 | あれば望ましい・体裁/エッジケース |

## Issue テンプレート

`.github/ISSUE_TEMPLATE/test-checklist.yml`（Issue Forms）から起票する。
ラベル `test` と該当 `phase-N` を付け、Milestone を Phase に対応させる。

## コミット前の鮮度チェック（pre-commit）

検証シートがコードから取り残されないよう、`lefthook` の pre-commit に
**鮮度チェック**を組み込んでいる（`scripts/check-test-sheet.mjs`）。

- **動作**: テーマの挙動コード（`sections/` `snippets/` `assets/` `templates/` `layout/` の
  `.liquid`/`.js`/`.json`）がステージされているのに `docs/test-cases/` が一緒に更新されて
  いない場合、注意喚起する
- **既定は非ブロック**（リマインダー）。「最新かどうか」の厳密判定は機械化できないため、
  挙動コード変更 × シート未更新を実用的なプロキシとして警告するに留める
- **厳格化**: `TEST_SHEET_STRICT=1` を付けて commit すると、その場合に `exit 1` でブロックする
- **回避**: 検証シート更新が不要なコミットは `git commit --no-verify` でスキップ可

> 真の「最新化」は人/AI の判断。警告が出たら「項目の追加・修正が要るか」を確認し、
> 必要なら phase-N.md を更新してから commit する運用。

## 監査コマンド例（AI / 人どちらでも）

```bash
gh issue list --label test --state open                 # 未消化のテスト Issue 一覧
gh issue view <number>                                   # 個別の進捗（未チェック項目）
gh issue list --label test --label bug --state open      # テスト由来の不具合
```
