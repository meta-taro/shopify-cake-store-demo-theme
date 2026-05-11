// Capture baseline screenshots of the running `shopify theme dev` server.
//
// Usage:
//   1. Start the dev server in another terminal:
//      shopify theme dev --store sweet-atelier-demo.myshopify.com
//   2. Run this script:
//      npm run screenshot:baseline -- [--label baseline]
//
// Output:
//   docs/screenshots/<label>/<viewport>/<page>.png
//   (label defaults to "baseline")

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:9292";

const labelArgIdx = process.argv.indexOf("--label");
const LABEL =
  labelArgIdx >= 0 && process.argv[labelArgIdx + 1]
    ? process.argv[labelArgIdx + 1]
    : "baseline";

const PAGES = [
  { name: "01-home", path: "/" },
  { name: "02-cart-empty", path: "/cart" },
  { name: "03-not-found", path: "/this-url-does-not-exist" },
  { name: "04-product-strawberry", path: "/products/strawberry-shortcake" },
  { name: "05-page-delivery", path: "/pages/delivery" },
  { name: "06-page-faq", path: "/pages/faq" },
  { name: "07-page-legal", path: "/pages/legal" },
  { name: "08-page-store-info", path: "/pages/store-info" },
];

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

async function main() {
  await precheck();
  console.log(`[capture] target: ${BASE_URL}`);
  console.log(`[capture] label : ${LABEL}`);

  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      const outDir = join(ROOT, "docs", "screenshots", LABEL, vp.name);
      await ensureDir(outDir);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.name === "mobile" ? 2 : 1,
        ignoreHTTPSErrors: true,
        // reveal-on-scroll sections sit at opacity:0.01 until scrolled into
        // view; a fullPage screenshot captures them blank. Emulating reduced
        // motion skips that guard so every section renders at its final state.
        reducedMotion: "reduce",
      });
      const page = await context.newPage();

      for (const target of PAGES) {
        const url = `${BASE_URL}${target.path}`;
        const outFile = join(outDir, `${target.name}.png`);
        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
        } catch (e) {
          console.warn(`[capture] ${vp.name} ${target.name}: navigation slow (${e.message}) — capturing anyway`);
        }
        await page.screenshot({ path: outFile, fullPage: true });
        console.log(`[capture] ${vp.name} ${target.name} -> ${outFile}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
