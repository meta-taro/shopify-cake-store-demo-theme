// Capture Lighthouse audits for the running `shopify theme dev` server.
//
// Usage:
//   1. Start the dev server in another terminal:
//      shopify theme dev --store sweet-atelier-demo.myshopify.com
//   2. Run this script:
//      npm run lighthouse:capture -- [--label phase-3]
//
// Output:
//   docs/lighthouse/<label>/<device>/<page>.json   # full JSON report
//   docs/lighthouse/<label>/<device>/<page>.html   # human-readable HTML report
//   docs/lighthouse/<label>/summary.json           # scores summary
//   docs/lighthouse/<label>/summary.md             # markdown table
//
// Requires:
//   - Google Chrome (or Chromium) installed on PATH
//   - lighthouse + chrome-launcher (already in devDependencies)

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:9292";

const labelArgIdx = process.argv.indexOf("--label");
const LABEL =
  labelArgIdx >= 0 && process.argv[labelArgIdx + 1]
    ? process.argv[labelArgIdx + 1]
    : "phase-3";

const PAGES = [
  { name: "01-home", path: "/" },
  { name: "04-product-strawberry", path: "/products/strawberry-shortcake" },
  { name: "05-page-delivery", path: "/pages/delivery" },
  { name: "06-page-faq", path: "/pages/faq" },
];

const DEVICES = ["desktop", "mobile"];

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

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

function buildOptions(devicePreset, port) {
  return {
    logLevel: "error",
    output: ["json", "html"],
    onlyCategories: CATEGORIES,
    port,
    formFactor: devicePreset,
    screenEmulation:
      devicePreset === "mobile"
        ? { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }
        : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling:
      devicePreset === "mobile"
        ? {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          }
        : {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
  };
}

function scoreOf(category) {
  return category && typeof category.score === "number" ? Math.round(category.score * 100) : null;
}

function fmt(score) {
  if (score === null || score === undefined) return "—";
  return String(score);
}

async function main() {
  await precheck();
  console.log(`[lh] target: ${BASE_URL}`);
  console.log(`[lh] label : ${LABEL}`);
  console.log(`[lh] pages : ${PAGES.length} × devices ${DEVICES.length} = ${PAGES.length * DEVICES.length} runs`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });
  console.log(`[lh] chrome port ${chrome.port}`);

  const summary = [];

  try {
    for (const device of DEVICES) {
      const outDir = join(ROOT, "docs", "lighthouse", LABEL, device);
      await mkdir(outDir, { recursive: true });

      for (const target of PAGES) {
        const url = `${BASE_URL}${target.path}`;
        const options = buildOptions(device, chrome.port);

        const startedAt = Date.now();
        let runnerResult;
        try {
          runnerResult = await lighthouse(url, options);
        } catch (e) {
          console.warn(`[lh] ${device} ${target.name}: FAILED — ${e.message}`);
          summary.push({
            device,
            page: target.name,
            url,
            performance: null,
            accessibility: null,
            bestPractices: null,
            seo: null,
            error: e.message,
          });
          continue;
        }

        const reports = Array.isArray(runnerResult.report) ? runnerResult.report : [runnerResult.report];
        const [jsonReport, htmlReport] = reports;

        await writeFile(join(outDir, `${target.name}.json`), jsonReport);
        if (htmlReport) {
          await writeFile(join(outDir, `${target.name}.html`), htmlReport);
        }

        const cats = runnerResult.lhr.categories;
        const row = {
          device,
          page: target.name,
          url,
          performance: scoreOf(cats.performance),
          accessibility: scoreOf(cats.accessibility),
          bestPractices: scoreOf(cats["best-practices"]),
          seo: scoreOf(cats.seo),
        };
        summary.push(row);

        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
        console.log(
          `[lh] ${device.padEnd(7)} ${target.name.padEnd(24)} ` +
            `perf=${fmt(row.performance)} a11y=${fmt(row.accessibility)} ` +
            `bp=${fmt(row.bestPractices)} seo=${fmt(row.seo)} ` +
            `(${elapsed}s)`,
        );
      }
    }

    const summaryDir = join(ROOT, "docs", "lighthouse", LABEL);
    await writeFile(join(summaryDir, "summary.json"), JSON.stringify(summary, null, 2));

    const md = renderMarkdown(LABEL, summary);
    await writeFile(join(summaryDir, "summary.md"), md);

    console.log(`\n[lh] summary written: docs/lighthouse/${LABEL}/summary.{json,md}`);
  } finally {
    await chrome.kill();
  }
}

function renderMarkdown(label, rows) {
  const header = `# Lighthouse — ${label}\n\nCaptured ${new Date().toISOString()} against \`${BASE_URL}\`.\n\nScores are 0–100 (higher is better). Lighthouse defaults:\n- Performance: ≥90 good, 50–89 needs work, <50 poor\n- Accessibility / Best Practices / SEO: similar bands\n\n`;
  const byDevice = DEVICES.map((device) => {
    const deviceRows = rows.filter((r) => r.device === device);
    const lines = [
      `## ${device}\n`,
      "| Page | Performance | Accessibility | Best Practices | SEO |",
      "|---|---:|---:|---:|---:|",
      ...deviceRows.map(
        (r) =>
          `| ${r.page} | ${fmt(r.performance)} | ${fmt(r.accessibility)} | ${fmt(r.bestPractices)} | ${fmt(r.seo)} |`,
      ),
      "",
    ];
    return lines.join("\n");
  }).join("\n");
  return header + byDevice;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
