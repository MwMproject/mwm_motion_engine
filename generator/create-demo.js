/**
 * ============================================================
 * MwM PROJECT — DEMO GENERATOR
 * Generates: intro → demo → outro + full HTML wrapper
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyFolder(src, dest) {
  ensureDir(dest);
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) copyFolder(s, d);
    else copyFile(s, d);
  }
}

/* ------------------------------------------------------------
   INPUTS
------------------------------------------------------------ */
const demoName = process.argv[2];
const pageTitle = process.argv[3] || "MwM Demo";

if (!demoName) {
  console.log('❌ Usage: node generator/create-demo.js <templateName> "Title"');
  process.exit(1);
}

const safeDemoName = demoName.toLowerCase().replace(/\s+/g, "-");
const outputDir = path.join("output", safeDemoName);

/* ------------------------------------------------------------
   TEMPLATE PATHS
------------------------------------------------------------ */
const TEMPLATE_DIR = path.join("templates", safeDemoName);
const BASE_DIR = path.join("templates", "base");

if (!fs.existsSync(TEMPLATE_DIR)) {
  console.log(`❌ Template not found: ${TEMPLATE_DIR}`);
  process.exit(1);
}

["demo.html", "demo.css", "demo.js"].forEach((file) => {
  if (!fs.existsSync(path.join(TEMPLATE_DIR, file))) {
    console.log(`❌ Missing required template file: ${file}`);
    process.exit(1);
  }
});

/* ------------------------------------------------------------
   CLEAN OLD VERSION
------------------------------------------------------------ */
if (fs.existsSync(outputDir)) {
  console.log("🧹 Removing previous version…");
  fs.rmSync(outputDir, { recursive: true, force: true });
}
ensureDir(outputDir);

/* ------------------------------------------------------------
   LOAD TEMPLATE CONTENT
------------------------------------------------------------ */
let introHTML = fs.readFileSync(path.join(BASE_DIR, "intro.html"), "utf8");
let outroHTML = fs.readFileSync(path.join(BASE_DIR, "outro.html"), "utf8");
const demoHTML = fs.readFileSync(path.join(TEMPLATE_DIR, "demo.html"), "utf8");

/* Inject dynamic titles */
introHTML = introHTML.replace(
  "</div>",
  `  <h2 class="intro-demo-name">${pageTitle}</h2>\n</div>`
);

/* ------------------------------------------------------------
   COPY SHARED ASSETS
------------------------------------------------------------ */
copyFile("shared/mwm.css", path.join(outputDir, "mwm.css"));
copyFile("shared/mwm_particules.js", path.join(outputDir, "mwm_particules.js"));
copyFile("shared/logo_mwm.png", path.join(outputDir, "logo_mwm.png"));

/* ------------------------------------------------------------
   COPY TEMPLATE FILES (CSS + JS)
------------------------------------------------------------ */
copyFile(path.join(TEMPLATE_DIR, "demo.css"), path.join(outputDir, "demo.css"));

copyFile(path.join(TEMPLATE_DIR, "demo.js"), path.join(outputDir, "demo.js"));

/* ------------------------------------------------------------
   GENERATE FINAL INDEX.HTML
------------------------------------------------------------ */
const finalHTML = `
<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, initial-scale=1.0">
  <title>${pageTitle}</title>

  <link rel="stylesheet" href="./mwm.css">
  <link rel="stylesheet" href="./demo.css">
</head>

<body>

  <canvas id="particles"></canvas>

  <div class="reel">

    <!-- INTRO -->
    <section class="slide active" id="intro">
      <div class="slide-inner">
${introHTML}
      </div>
    </section>

    <!-- DEMO -->
    <section class="slide" id="${safeDemoName}-demo">
${demoHTML}
    </section>

    <!-- OUTRO -->
    <section class="slide" id="outro">
      <div class="slide-inner">
${outroHTML}
      </div>
    </section>

  </div>

  <script src="./mwm_particules.js"></script>
  <script src="./demo.js"></script>

  <!-- DEMO ENGINE V2 -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const slides = ["intro", "${safeDemoName}-demo", "outro"];
      const timings = [3000, 20000, 3000];
      let current = 0;

      function showSlide(i) {
        document.querySelectorAll(".slide").forEach(s => {
          s.classList.remove("active");
          s.classList.add("hidden");
        });

        const id = slides[i];
        const el = document.getElementById(id);

        el.classList.remove("hidden");
        el.classList.add("active");

        if (id === "${safeDemoName}-demo" && typeof startDemo === "function") {
          startDemo();
        }
      }

      showSlide(0);

      function next() {
        current++;
        if (current >= slides.length) return;
        showSlide(current);
        setTimeout(next, timings[current]);
      }

      setTimeout(next, timings[0]);
    });
  </script>

</body>
</html>
`;

fs.writeFileSync(path.join(outputDir, "index.html"), finalHTML, "utf8");

console.log("✔ Demo generated:", outputDir);
console.log("✔ Injected titles:", pageTitle);
console.log("✨ Ready to render!");
