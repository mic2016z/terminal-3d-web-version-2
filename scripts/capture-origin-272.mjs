import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const URL = "https://terminal-industries.com/";
const FRAME_COUNT = 272;
const WIDTH = 1365;
const HEIGHT = 768;
const STEP_DELAY_MS = 40;
const OUTPUT_DIR = path.resolve("reference", "origin-scroll-272");

function pad(n) {
  return String(n).padStart(3, "0");
}

async function main() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(1500);

  const docHeight = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
  );
  const maxScroll = Math.max(0, docHeight - HEIGHT);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const progress = FRAME_COUNT === 1 ? 0 : i / (FRAME_COUNT - 1);
    const y = Math.round(progress * maxScroll);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(STEP_DELAY_MS);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${pad(i)}.png`),
      type: "png",
      fullPage: false,
    });
  }

  await browser.close();

  const captured = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png")).length;
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({ url: URL, framesRequested: FRAME_COUNT, framesCaptured: captured, outputDir: OUTPUT_DIR }),
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
