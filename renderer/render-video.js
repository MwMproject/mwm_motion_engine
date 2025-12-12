/**
 * ============================================================
 * MwM MOTION ENGINE — VIDEO RENDERER V4 (STABLE)
 *
 * - Capture en temps réel (PAS de fake FPS)
 * - Durée exacte
 * - Timing identique au navigateur
 * - Compatible Engine v3+ (window.setSlide)
 * ============================================================
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------

const WIDTH = 1080;
const HEIGHT = 1920;

const FPS = 60;

const INTRO_SECONDS = 3;
const DEMO_SECONDS = 24;
const OUTRO_SECONDS = 3;

const TOTAL_SECONDS = INTRO_SECONDS + DEMO_SECONDS + OUTRO_SECONDS;

// ------------------------------------------------------------

async function renderVideo(inputHTML, outputName = null) {
  console.log("\n──────────────────────────────────────────");
  console.log("🎬 MwM VIDEO RENDERER v4");
  console.log("──────────────────────────────────────────\n");

  if (!fs.existsSync(inputHTML)) {
    console.error("❌ HTML not found:", inputHTML);
    process.exit(1);
  }

  const rendererDir = __dirname;
  const framesDir = path.join(rendererDir, "frames_temp");
  const videosDir = path.join(rendererDir, "videos");

  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir);

  // Nom automatique
  const baseName = outputName || path.basename(path.dirname(inputHTML));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const outputMP4 = path.join(videosDir, `${baseName}_${timestamp}.mp4`);

  console.log("📄 HTML :", inputHTML);
  console.log("🎞  OUTPUT :", outputMP4);
  console.log(
    `⏱  DURATION : ${TOTAL_SECONDS}s (${INTRO_SECONDS}s + ${DEMO_SECONDS}s + ${OUTRO_SECONDS}s)`
  );
  console.log(`🎥 FPS : ${FPS}\n`);

  // ----------------------------------------------------------
  // Launch browser
  // ----------------------------------------------------------

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
    },
    args: ["--disable-gpu"],
  });

  const page = await browser.newPage();

  // 🔑 Flag rendering mode
  await page.evaluateOnNewDocument(() => {
    window.__MWM_RENDERING__ = true;
  });

  await page.goto("file://" + path.resolve(inputHTML), {
    waitUntil: "load",
  });

  // ----------------------------------------------------------
  // SLIDE TIMELINE (renderer-controlled)
  // ----------------------------------------------------------

  const timeline = [
    { id: "intro", duration: INTRO_SECONDS },
    {
      id: page.evaluate(
        () => document.querySelector(".slide:not(#intro):not(#outro)")?.id
      ),
      duration: DEMO_SECONDS,
    },
    { id: "outro", duration: OUTRO_SECONDS },
  ];

  // Resolve demo slide ID
  const demoId = await page.evaluate(() => {
    const slides = [...document.querySelectorAll(".slide")];
    return slides.find((s) => s.id !== "intro" && s.id !== "outro")?.id;
  });

  timeline[1].id = demoId;

  console.log("🧭 SLIDES :", timeline.map((s) => s.id).join(" → "), "\n");

  // ----------------------------------------------------------
  // CAPTURE LOOP (REAL TIME)
  // ----------------------------------------------------------

  let frameIndex = 0;

  async function capture(seconds) {
    const totalFrames = Math.floor(seconds * FPS);
    const start = Date.now();

    for (let i = 0; i < totalFrames; i++) {
      const file = path.join(
        framesDir,
        `frame_${String(frameIndex).padStart(5, "0")}.png`
      );

      await page.screenshot({ path: file });
      frameIndex++;

      // ⏱ Real-time pacing
      const elapsed = Date.now() - start;
      const target = (i + 1) * (1000 / FPS);
      const delay = Math.max(0, target - elapsed);

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // ----------------------------------------------------------
  // RUN TIMELINE
  // ----------------------------------------------------------

  for (const step of timeline) {
    console.log("▶ Slide:", step.id);

    await page.evaluate((id) => {
      window.setSlide(id);
    }, step.id);

    await capture(step.duration);
  }

  await browser.close();

  console.log("\n📦 Frames captured. Encoding video...\n");

  // ----------------------------------------------------------
  // FFMPEG
  // ----------------------------------------------------------

  const ffmpegCmd = `
ffmpeg -y
-framerate ${FPS}
-i "${framesDir}/frame_%05d.png"
-vf "format=yuv420p"
-c:v libx264
-pix_fmt yuv420p
"${outputMP4}"
`.replace(/\n/g, " ");

  execSync(ffmpegCmd, { stdio: "inherit" });

  // Cleanup
  fs.rmSync(framesDir, { recursive: true, force: true });

  console.log("\n🎉 VIDEO READY");
  console.log("📍", outputMP4);
}

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------

const inputHTML = process.argv[2];

if (!inputHTML) {
  console.log("❌ Usage: node render-video.js <index.html>");
  process.exit(1);
}

renderVideo(inputHTML);
