/**
 * ============================================================
 * MwM PROJECT — VIDEO RENDERER (Version A — Stable)
 * Puppeteer → PNG Frames → FFmpeg MP4 (1080×1920)
 * ============================================================
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ------------------------------------------------------------
//  Utilities
// ------------------------------------------------------------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function extractDemoName(inputHTML) {
  if (!inputHTML) return "demo";

  // Always resolve to absolute path
  const normalized = path.resolve(inputHTML);

  const folderName = path.basename(path.dirname(normalized));
  if (!folderName) return "demo";

  // Clean demo name
  return folderName.replace(/[^a-z0-9\-]/gi, "") || "demo";
}

// ------------------------------------------------------------
//  Main renderer function
// ------------------------------------------------------------
async function renderVideo(inputHTML, outputName = null) {
  console.log("\n──────────────────────────────────────────");
  console.log("🎬 MwM VIDEO RENDERER — Stable Version A");
  console.log("──────────────────────────────────────────\n");

  if (!fs.existsSync(inputHTML)) {
    console.error("❌ Input HTML not found:", inputHTML);
    process.exit(1);
  }

  // Main parameters
  const FPS = 60;
  const DURATION = 26; // seconds (intro + demo + outro)
  const TOTAL_FRAMES = FPS * DURATION;

  console.log(`🎞  Total frames: ${TOTAL_FRAMES}\n`);

  // Prepare directories
  const RENDER_DIR = __dirname;
  const FRAMES_DIR = path.join(RENDER_DIR, "frames_temp");
  const VIDEOS_DIR = path.join(RENDER_DIR, "videos");

  ensureDir(FRAMES_DIR);
  ensureDir(VIDEOS_DIR);

  // Auto name if not provided
  const demoName = extractDemoName(inputHTML);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = outputName || `${demoName}_${timestamp}.mp4`;

  const outputMP4 = path.join(VIDEOS_DIR, fileName);

  // ------------------------------------------------------------
  // Puppeteer capture
  // ------------------------------------------------------------
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1080, height: 1920 },
  });

  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(inputHTML));

  console.log("📸 Capturing frames…");

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const num = String(i).padStart(5, "0");
    const img = path.join(FRAMES_DIR, `frame_${num}.png`);

    await page.screenshot({ path: img, type: "png" });

    // Keep timing stable
    await new Promise((res) => setTimeout(res, 1000 / FPS));

    process.stdout.write(`  Frame ${i + 1}/${TOTAL_FRAMES}\r`);
  }

  await browser.close();
  console.log("\n✓ Frames OK — Encoding with FFmpeg…\n");

  // ------------------------------------------------------------
  // VIDEO ENCODING
  // ------------------------------------------------------------
  const ffmpegCmd = `"ffmpeg" -y -framerate ${FPS} -i "frames_temp/frame_%05d.png" -vf "format=yuv420p" "${fileName}"`;

  try {
    execSync(ffmpegCmd, {
      stdio: "inherit",
      cwd: VIDEOS_DIR, // saves video inside /videos
    });
  } catch (err) {
    console.error("❌ FFmpeg error:", err);
  }

  // ------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log("\n🧹 Temp frames deleted.");

  console.log(`\n🎉 VIDEO READY → ${outputMP4}\n`);
}

// ------------------------------------------------------------
//  CLI
// ------------------------------------------------------------
const inputHTML = process.argv[2];
const outputName = process.argv[3] || null;

renderVideo(inputHTML, outputName);
