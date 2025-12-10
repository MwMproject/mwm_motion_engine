/**
 * ============================================================
 * MwM Motion Engine — VIDEO RENDERER
 * Puppeteer → PNG Frames → FFmpeg MP4 1080x1920
 *
 * Stable timing:
 *   intro: 3s
 *   demo:  22s
 *   outro: 3s
 *
 * Usage:
 *   node renderer/render-video.js ./output/css-border-demo/index.html
 *
 * Output:
 *   renderer/videos/<demoName>_YYYYMMDD-HHMMSS.mp4
 * ============================================================
 */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ---------- SETTINGS (modifiable) ----------
const FPS = 60; // 60 = ultra smooth
const DUR_INTRO = 3; // seconds
const DUR_DEMO = 22;
const DUR_OUTRO = 3;

// ---------- UTILITIES ----------
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function timestamp() {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "-" +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    String(d.getSeconds()).padStart(2, "0")
  );
}

function extractDemoName(htmlPath) {
  const parts = htmlPath.split(path.sep);
  const folder = parts[parts.length - 2];
  return folder.replace(/[^a-z0-9\-]/gi, "");
}

// ---------- MAIN FUNCTION ----------
async function renderVideo(inputHTML) {
  if (!inputHTML || !fs.existsSync(inputHTML)) {
    console.error("❌ HTML introuvable :", inputHTML);
    process.exit(1);
  }

  // ---------- Extract demo name for output file ----------
  const demoName = extractDemoName(inputHTML);
  const outputDir = path.join(__dirname, "videos");
  const framesDir = path.join(__dirname, "frames_temp");

  const videoName = `${demoName}_${timestamp()}.mp4`;
  const videoPath = path.join(outputDir, videoName);

  // ---------- Prepare folders ----------
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

  console.log("──────────────────────────────────────────");
  console.log("🎬 MwM VIDEO RENDERER V2");
  console.log("──────────────────────────────────────────");
  console.log("📄 Input HTML :", inputHTML);
  console.log("🎞 Output MP4 :", videoPath);
  console.log(`🎥 FPS = ${FPS}`);
  console.log("──────────────────────────────────────────");

  // ---------- Total frames ----------
  const totalFrames = (DUR_INTRO + DUR_DEMO + DUR_OUTRO) * FPS;

  // ---------- Launch browser ----------
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1080, height: 1920 },
  });

  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(inputHTML));

  console.log(`📸 Capturing ${totalFrames} frames...`);

  // ---------- CAPTURE LOOP ----------
  for (let i = 0; i < totalFrames; i++) {
    const num = String(i).padStart(5, "0");
    const file = path.join(framesDir, `frame_${num}.png`);

    await page.screenshot({ path: file });
    await wait(1000 / FPS);

    process.stdout.write(`📸 Frame ${i + 1}/${totalFrames}\r`);
  }

  await browser.close();
  console.log("\n📦 Frames captured. Encoding video...");

  // FFmpeg command
  const ffmpegCmd = `"ffmpeg" -y -framerate ${FPS} -i "${framesDir}/frame_%05d.png" -vf "format=yuv420p" "${videoPath}"`;

  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
  } catch (err) {
    console.error("❌ FFmpeg error:", err);
    return;
  }

  console.log("\n🎉 VIDEO SAVED →", videoPath);

  // Clean frames
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log("🧹 Temporary frames cleaned.");
}

// ---------- CLI ----------
const inputHTML = process.argv[2];

if (!inputHTML) {
  console.log("❌ Usage: node renderer/render-video.js <path/to/index.html>");
  process.exit(1);
}

renderVideo(inputHTML);
