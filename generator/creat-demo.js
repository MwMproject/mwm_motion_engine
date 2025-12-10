/**
 * ============================================================
 * MwM Motion Engine — DEMO GENERATOR
 *
 * Usage:
 *    node generator/create-demo.js css-border "CSS Border Demo"
 *
 * Output:
 *    /output/css-border-demo/index.html
 *    + demo.css / demo.js / mwm.css / mwm_particles.js / logo
 *
 * Requirements:
 *    templates/<demo>/demo.html, demo.css, demo.js
 *
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

// ---------- Helpers ----------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyFolder(src, dest) {
  ensureDir(dest);
  fs.readdirSync(src).forEach((item) => {
    const s = path.join(src, item);
    const d = path.join(dest, item);

    if (fs.statSync(s).isDirectory()) {
      copyFolder(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  });
}

// ---------- Inputs ----------
const demoName = process.argv[2];
const pageTitle = process.argv[3] || "MwM Demo";

if (!demoName) {
  console.log(
    '❌ Usage : node generator/create-demo.js <templateName> "Page Title"'
  );
  process.exit(1);
}

const safeName = demoName.toLowerCase().replace(/\s+/g, "-");
const outputName = pageTitle.toLowerCase().replace(/\s+/g, "-");

// Paths
const TEMPLATE_DIR = path.join("templates", safeName);
const BASE_DIR = path.join("templates", "base");
const OUT_DIR = path.join("output", outputName);

// ---------- Validate template ----------
if (!fs.existsSync(TEMPLATE_DIR)) {
  console.log(`❌ Template introuvable : ${TEMPLATE_DIR}`);
  process.exit(1);
}

["demo.html", "demo.css", "demo.js"].forEach((file) => {
  if (!fs.existsSync(path.join(TEMPLATE_DIR, file))) {
    console.log(`❌ Fichier manquant dans template : ${file}`);
    process.exit(1);
  }
});

// ---------- Clean output folder ----------
cleanDir(OUT_DIR);

// ---------- Copy shared assets ----------

copyFolder("shared", OUT_DIR);

// ---------- Copy template assets (css, js, images…) ----------
copyFolder(TEMPLATE_DIR, OUT_DIR);

// ---------- Load fragments ----------
const introHTML = fs.readFileSync(path.join(BASE_DIR, "intro.html"), "utf8");
const outroHTML = fs.readFileSync(path.join(BASE_DIR, "outro.html"), "utf8");
const demoHTML = fs.readFileSync(path.join(TEMPLATE_DIR, "demo.html"), "utf8");

// ---------- Demo Engine ----------

const DEMO_ENGINE = `
<script>
document.addEventListener("DOMContentLoaded", () => {
  const slides = ["intro", "${safeName}-demo", "outro"];
  const timings = [3000, 22000, 3000]; // intro / demo / outro

  let current = 0;

  function showSlide(i) {
    document.querySelectorAll(".slide").forEach(s => {
      s.classList.remove("active");
      s.classList.add("hidden");
    });

    const id = slides[i];
    const el = document.getElementById(id);

    if (!el) return;

    el.classList.remove("hidden");
    el.classList.add("active");

    if (id === "${safeName}-demo" && typeof startDemo === "function") {
      startDemo();
    }
  }

  showSlide(0);

  function nextSlide() {
    current++;
    if (current >= slides.length) return;
    showSlide(current);
    setTimeout(nextSlide, timings[current]);
  }

  setTimeout(nextSlide, timings[0]);
});
</script>
`;

// ---------- Generate index.html ----------
const finalHTML = `
<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, initial-scale=1.0" />
  <title>${pageTitle}</title>

  <link rel="stylesheet" href="./mwm.css" />
  <script src="./mwm_particles.js" defer></script>

  <link rel="stylesheet" href="./demo.css" />
</head>

<body>
  <canvas id="particles"></canvas>

  <div class="reel">

    <!-- INTRO -->
    <section class="slide active" id="intro">
      <div class="slide-inner">${introHTML}</div>
    </section>

    <!-- DEMO -->
    <section class="slide" id="${safeName}-demo">
      ${demoHTML}
    </section>

    <!-- OUTRO -->
    <section class="slide" id="outro">
      <div class="slide-inner">${outroHTML}</div>
    </section>

  </div>

  <script src="./demo.js"></script>
  ${DEMO_ENGINE}

</body>
</html>
`;

// ---------- Write final file ----------
fs.writeFileSync(path.join(OUT_DIR, "index.html"), finalHTML, "utf8");

console.log("✔ Demo generated →", OUT_DIR);
