// Capture Phase 7 (gift experience) interaction-state screenshots.
//
// Unlike capture-screenshots.mjs (static fullPage), Phase 7 features only
// appear after user interaction (toggle on, radio select, text input), so
// this script drives the gift-options widget and shoots the element close-up.
//
// Usage:
//   1. Start the dev server in another terminal:
//      shopify theme dev --store sweet-atelier-demo.myshopify.com
//   2. Run this script:
//      npm run screenshot:phase7
//
// Output:
//   docs/screenshots/phase-7/<viewport>/<name>.png

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:9292";
const PRODUCT_PATH = process.env.PRODUCT_PATH ?? "/products/strawberry-shortcake";
const LABEL = "phase-7";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 }, // iPhone 14 相当
];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function precheck() {
  const res = await fetch(`${BASE_URL}/`).catch((e) => {
    throw new Error(
      `dev server unreachable at ${BASE_URL}\n` +
        `  ${e.message}\n` +
        `  Start it with: shopify theme dev --store sweet-atelier-demo.myshopify.com`,
    );
  });
  if (!res.ok) {
    throw new Error(`dev server returned HTTP ${res.status} at ${BASE_URL}/`);
  }
}

// Each scenario starts from a freshly reloaded PDP so widget state never bleeds
// between shots. The callback drives the gift-options widget, then we shoot the
// gift-options fieldset element (not fullPage) for a focused before/after.
async function shoot(page, outDir, name, drive) {
  const url = `${BASE_URL}${PRODUCT_PATH}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch((e) => {
    console.warn(`[capture] ${name}: navigation slow (${e.message}) — continuing`);
  });

  const gift = page.locator("[data-gift-options]").first();
  await gift.scrollIntoViewIfNeeded();
  await drive(page, gift);

  const outFile = join(outDir, `${name}.png`);
  await gift.screenshot({ path: outFile });
  console.log(`[capture] ${name} -> ${outFile}`);
}

async function captureViewport(browser, vp) {
  const outDir = join(ROOT, "docs", "screenshots", LABEL, vp.name);
  await ensureDir(outDir);

  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.name === "mobile" ? 2 : 1,
    ignoreHTTPSErrors: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  // 7a — ギフトラッピング ON → ラジオカード3種、「リボン付き」選択中
  await shoot(page, outDir, "01-wrapping-radios", async (_p, gift) => {
    await gift.locator('[data-gift-toggle="wrapping"]').check();
    await gift.locator('input[name="properties[ギフトラッピング]"][value="リボン付き"]').check();
  });

  // 7b — メッセージカード文字数カウンター（90字到達=アンバー警告）
  await shoot(page, outDir, "02-counter-warning", async (_p, gift) => {
    await gift.locator("[data-gift-counter-input]").fill("あ".repeat(92));
  });

  // 7b — 100字到達=赤系 limit
  await shoot(page, outDir, "03-counter-limit", async (_p, gift) => {
    await gift.locator("[data-gift-counter-input]").fill("あ".repeat(100));
  });

  // 7c — 熨斗 ON → 用途「御祝」+ 名入れ → 紅白水引きプレビュー表示
  await shoot(page, outDir, "04-noshi-preview", async (_p, gift) => {
    await gift.locator('[data-gift-toggle="noshi"]').check();
    await gift.locator("[data-noshi-purpose-input]").selectOption("御祝");
    await gift.locator("[data-noshi-name-input]").fill("田中");
  });

  await context.close();
}

async function main() {
  await precheck();
  console.log(`[capture] target : ${BASE_URL}${PRODUCT_PATH}`);
  console.log(`[capture] label  : ${LABEL}`);

  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      await captureViewport(browser, vp);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
