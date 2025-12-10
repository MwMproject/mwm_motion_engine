/**
 * ============================================================
 * MwM PROJECT — VIDEO RENDERER
 * Puppeteer → PNG Frames → FFmpeg → MP4 1080x1920 @ 60 FPS
 * ============================================================
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/* ------------------------------------------------------------
   SETTINGS
------------------------------------------------------------ */
const FPS = 60; // Fluidité parfaite
const INTRO_TIME = 3; // secondes
const DEMO_TIME = 20; // secondes
const OUTRO_TIME = 3; // secondes

const TOTAL_DURATION = INTRO_TIME + DEMO_TIME + OUTRO_TIME; // secondes
const TOTAL_FRAMES = TOTAL_DURATION * FPS;

/* ------------------------------------------------------------
   INPUTS
------------------------------------------------------------ */
const inputHTML = process.argv[2];

if (!inputHTML) {
  console.log("❌ Usage: node render-video.js <path/to/index.html>");
  process.exit(1);
}

// Nom automatique basé sur le dossier de démo
const demoFolder = path.basename(path.dirname(inputHTML));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputMP4 = path.join(
  __dirname,
  "videos",
  `${demoFolder}_${timestamp}.mp4`
);

/* ------------------------------------------------------------
   DIRECTORIES
------------------------------------------------------------ */
const FRAMES_DIR = path.join(__dirname, "frames_temp");
const OUTPUT_DIR = path.join(__dirname, "videos");

// Create folders if missing
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });

/* ------------------------------------------------------------
   MAIN RENDER FUNCTION
------------------------------------------------------------ */
async function render() {
  console.log("─────────────────────────────────────────────");
  console.log("🎬 MwM VIDEO RENDERER V3");
  console.log("─────────────────────────────────────────────");
  console.log("📄 HTML:", inputHTML);
  console.log("🎞 Output:", outputMP4);
  console.log(`⏱ Duration: ${TOTAL_DURATION}s  •  FPS: ${FPS}`);
  console.log(`🎥 Total frames: ${TOTAL_FRAMES}`);
  console.log("─────────────────────────────────────────────\n");

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1080, height: 1920 },
  });

  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(inputHTML));

  /* ------------------------------------------------------------
     FORCE l'Engine Demo à jouer à vitesse réelle.
     Important : Puppeteer ne doit JAMAIS sauter d'intervals.
------------------------------------------------------------ */
  await page.evaluate(() => {
    window.__FORCE_RENDER_MODE = true;
  });

  /* ------------------------------------------------------------
     CAPTURE LOUP
------------------------------------------------------------ */
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const filename = path.join(
      FRAMES_DIR,
      `frame_${String(i).padStart(5, "0")}.png`
    );
    await page.screenshot({ path: filename, type: "png" });

    // IMPORTANT pour la vitesse réelle :
    // Puppeteer doit patienter exactement 1 frame.
    await new Promise((res) => setTimeout(res, 1000 / FPS));

    process.stdout.write(`📸 Frame ${i + 1}/${TOTAL_FRAMES}\r`);
  }

  await browser.close();
  console.log("\n✔ Frames OK — Encoding with FFmpeg…\n");

  /* ------------------------------------------------------------
     FFMPEG — encode MP4
------------------------------------------------------------ */
  const ffmpegCmd = `
    ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 \
    "${outputMP4}"
  `;

  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
  } catch (err) {
    console.log("❌ FFmpeg ERROR");
    console.log(err);
  }

  /* ------------------------------------------------------------
     CLEAN TEMPORARY FRAMES
------------------------------------------------------------ */
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log("\n🧹 Temp frames deleted.");

  console.log("\n🎉 VIDEO READY →", outputMP4);
}

render();
