// Capture Phase 9 (回遊・パーソナライズ) interaction-state screenshots.
//
// Phase 9 の機能は localStorage 操作・ウィジェット操作の「後」にしか現れないため、
// capture-screenshots.mjs（静的 fullPage）ではなく、capture-phase-7.mjs と同じく
// 状態を作ってから対象要素を close-up 撮影する。
//
// 撮るもの:
//   9c 送料シミュレーター: /pages/delivery で都道府県を選択した結果（本州 / 送料無料 / 沖縄）
//   9b ウィッシュリスト  : コレクションのカードのハート ON / ヘッダー件数バッジ / PDP のお気に入りボタン
//   9a 最近見た商品      : 商品を数件閲覧してからトップで履歴セクションを表示
//
// Usage:
//   1. 別ターミナルで dev サーバーを起動: shopify theme dev --store sweet-atelier-demo.myshopify.com
//   2. pnpm run screenshot:phase9
//
// Output: docs/screenshots/phase-9/<viewport>/<name>.png

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:9292";
const LABEL = "phase-9";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 }, // iPhone 14 相当
];

// HMR の常時接続で networkidle がタイムアウトするため、load で待って個別要素を明示的に待つ。
const GOTO = { waitUntil: "load", timeout: 30_000 };

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function precheck() {
  const res = await fetch(`${BASE_URL}/`).catch((e) => {
    throw new Error(
      `dev server unreachable at ${BASE_URL}\n  ${e.message}\n` +
        `  Start it with: shopify theme dev --store sweet-atelier-demo.myshopify.com`,
    );
  });
  if (!res.ok) throw new Error(`dev server returned HTTP ${res.status} at ${BASE_URL}/`);
}

async function goto(page, path) {
  await page.goto(`${BASE_URL}${path}`, GOTO).catch((e) => {
    console.warn(`[capture] goto ${path}: slow (${e.message}) — continuing`);
  });
}

async function shoot(locator, outDir, name) {
  const outFile = join(outDir, `${name}.png`);
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.screenshot({ path: outFile });
  console.log(`[capture] ${name} -> ${outFile}`);
}

// 9c 送料シミュレーター ---------------------------------------------------------
async function captureShipping(context, outDir) {
  const page = await context.newPage();
  const sim = page.locator("shipping-simulator");

  await goto(page, "/pages/delivery");
  await sim.waitFor({ state: "visible", timeout: 15_000 });

  // 本州（東京都・金額なし）
  await sim.locator("[data-pref-select]").selectOption("東京都");
  await page.waitForFunction(() =>
    /配送区分/.test(document.querySelector("shipping-simulator [data-result]")?.textContent ?? ""),
  );
  await shoot(sim, outDir, "01-shipping-honshu");

  // 送料無料（東京都・¥10,000）
  await sim.locator("[data-amount-input]").fill("10000");
  await page.waitForFunction(() =>
    /送料無料/.test(document.querySelector("shipping-simulator [data-result]")?.textContent ?? ""),
  );
  await shoot(sim, outDir, "02-shipping-free");

  // 沖縄（対象外注記）
  await sim.locator("[data-amount-input]").fill("");
  await sim.locator("[data-pref-select]").selectOption("沖縄県");
  await page.waitForFunction(() =>
    /沖縄県/.test(document.querySelector("shipping-simulator [data-result]")?.textContent ?? ""),
  );
  await shoot(sim, outDir, "03-shipping-okinawa");

  await page.close();
}

// 9b ウィッシュリスト -----------------------------------------------------------
async function captureWishlist(context, outDir) {
  const page = await context.newPage();

  await goto(page, "/collections/all");
  // ウィッシュリストのハートを持つ最初のカード
  const card = page
    .locator("li.grid__item")
    .filter({ has: page.locator(".wishlist-toggle--card") })
    .first();
  await card.waitFor({ state: "visible", timeout: 15_000 });
  await card.locator(".wishlist-toggle--card button").click();
  // aria-pressed=true（ON）になるまで待つ
  await card
    .locator('.wishlist-toggle--card button[aria-pressed="true"]')
    .waitFor({ timeout: 5_000 });
  await shoot(card, outDir, "04-wishlist-card-active");

  // ヘッダーの件数バッジ（1 件入った状態）
  const header = page.locator(".header").first();
  await page.locator("wishlist-count:not([hidden])").waitFor({ timeout: 5_000 }).catch(() => {});
  await shoot(header, outDir, "05-wishlist-header-badge");

  // PDP のお気に入りボタン（テキスト付き）
  const handle = await firstProductHandle(page);
  if (handle) {
    await goto(page, `/products/${handle}`);
    const pdpToggle = page.locator(".wishlist-toggle--pdp").first();
    if (await pdpToggle.count()) {
      await pdpToggle.waitFor({ state: "visible", timeout: 10_000 });
      // この商品は手順04でカードから既に追加済みのことがある。クリックすると OFF に
      // 戻ってしまうため、未追加（aria-pressed=false）のときだけクリックして必ず ON で撮る。
      const btn = pdpToggle.locator("button");
      if ((await btn.getAttribute("aria-pressed")) !== "true") {
        await btn.click();
      }
      await pdpToggle
        .locator('button[aria-pressed="true"]')
        .waitFor({ timeout: 5_000 })
        .catch(() => {});
      await shoot(pdpToggle, outDir, "06-wishlist-pdp-button");
    } else {
      console.warn("[capture] 06-wishlist-pdp-button: .wishlist-toggle--pdp が見つからず skip");
    }
  }

  await page.close();
}

// 9a 最近見た商品 ---------------------------------------------------------------
async function captureRecentlyViewed(context, outDir) {
  const page = await context.newPage();

  // コレクションから商品 handle を集め、数件閲覧して履歴を作る
  await goto(page, "/collections/all");
  const handles = await page.$$eval('a[href*="/products/"]', (as) => {
    const out = [];
    for (const a of as) {
      const m = (a.getAttribute("href") || "").match(/\/products\/([^/?#]+)/);
      if (m && !out.includes(m[1])) out.push(m[1]);
    }
    return out;
  });
  const toVisit = handles.slice(0, 4);
  for (const h of toVisit) {
    await goto(page, `/products/${h}`);
    await page.locator("recently-viewed-products").waitFor({ timeout: 8_000 }).catch(() => {});
  }

  // トップで履歴セクションを表示（現在商品の除外なし＝全件表示）
  await goto(page, "/");
  const rv = page.locator("recently-viewed-products");
  await page
    .locator("recently-viewed-products:not([hidden]) .grid__item")
    .first()
    .waitFor({ timeout: 12_000 })
    .catch(() => {});
  if (await rv.evaluate((el) => !el.hidden).catch(() => false)) {
    await shoot(rv, outDir, "07-recently-viewed");
  } else {
    console.warn("[capture] 07-recently-viewed: 履歴セクションが表示されず skip");
  }

  await page.close();
}

async function firstProductHandle(page) {
  return page
    .$$eval('a[href*="/products/"]', (as) => {
      for (const a of as) {
        const m = (a.getAttribute("href") || "").match(/\/products\/([^/?#]+)/);
        if (m) return m[1];
      }
      return null;
    })
    .catch(() => null);
}

async function captureViewport(browser, vp) {
  const outDir = join(ROOT, "docs", "screenshots", LABEL, vp.name);
  await ensureDir(outDir);

  const baseContext = {
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.name === "mobile" ? 2 : 1,
    ignoreHTTPSErrors: true,
    reducedMotion: "reduce",
  };

  // 機能ごとに新しい context（localStorage を分離）
  for (const fn of [captureShipping, captureWishlist, captureRecentlyViewed]) {
    const context = await browser.newContext(baseContext);
    try {
      await fn(context, outDir);
    } catch (e) {
      console.warn(`[capture] ${vp.name} ${fn.name}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
}

async function main() {
  await precheck();
  console.log(`[capture] target: ${BASE_URL}`);
  console.log(`[capture] label : ${LABEL}`);

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
