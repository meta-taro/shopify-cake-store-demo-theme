// Pre-commit guard: テスト項目書（検証シート）の鮮度チェック。
//
// テーマの挙動コードを変更したコミットには、対応する検証シート
// (docs/test-cases/) の更新が伴っているのが望ましい。両者がズレると
// 「シートが最新でない」状態になるため、ステージされた差分を見て注意喚起する。
//
// 「最新かどうか」の厳密判定は機械化できないので、ここでは実用的なプロキシ
// として「挙動コードが変わったのに docs/test-cases/ が触られていない」場合に
// 警告する。あくまでリマインダー（既定では commit をブロックしない）。
//
// 厳格化したいとき: 環境変数 TEST_SHEET_STRICT=1 で exit 1（ブロック）になる。
// 一時的に黙らせたいとき: git commit --no-verify。

import { execSync } from "node:child_process";

// 変更されたら検証シートの見直しが要る「挙動コード」のディレクトリ。
// （docs/ や .github/ など非挙動の変更は対象外）
const THEME_DIRS = ["sections/", "snippets/", "assets/", "templates/", "layout/"];
const TEST_DIR = "docs/test-cases/";

// 装飾だけで挙動に影響しにくい拡張子は対象外（誤検知を減らす）
const RELEVANT_EXT = [".liquid", ".js", ".json"];

function stagedFiles() {
  // 追加/変更/リネームされたステージ済みファイル（削除は除く）
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf8",
  });
  return out.split("\n").map((s) => s.trim()).filter(Boolean);
}

function main() {
  const files = stagedFiles();
  if (files.length === 0) return;

  const themeChanges = files.filter(
    (f) =>
      THEME_DIRS.some((d) => f.startsWith(d)) &&
      RELEVANT_EXT.some((ext) => f.endsWith(ext)),
  );
  const sheetTouched = files.some((f) => f.startsWith(TEST_DIR));

  if (themeChanges.length === 0 || sheetTouched) return; // OK

  const strict = process.env.TEST_SHEET_STRICT === "1";
  const head = strict ? "[BLOCK]" : "[WARN]";
  const sample = themeChanges.slice(0, 5).map((f) => `    - ${f}`).join("\n");
  const more =
    themeChanges.length > 5 ? `\n    … ほか ${themeChanges.length - 5} 件` : "";

  console.warn(
    `\n${head} 検証シートの鮮度チェック\n` +
      `  テーマの挙動コードが変更されていますが、${TEST_DIR} が更新されていません:\n` +
      `${sample}${more}\n\n` +
      `  → 対応する検証シート（docs/test-cases/phase-N.md）が最新か確認してください。\n` +
      `     ・項目の追加/修正が要るなら更新してから commit\n` +
      `     ・このコミットに検証シート更新が不要なら、そのまま進めて構いません\n` +
      (strict
        ? `  （TEST_SHEET_STRICT=1 のためブロックします。回避: git commit --no-verify）\n`
        : `  （これは注意喚起です。commit はブロックしません。厳格化: TEST_SHEET_STRICT=1）\n`),
  );

  if (strict) process.exit(1);
}

main();
