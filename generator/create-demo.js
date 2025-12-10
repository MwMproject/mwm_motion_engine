/**
 * ============================================================
 * MwM PROJECT — DEMO GENERATOR (Clean Version)
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

// ---------------- Helpers ----------------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
    if (fs.statSync(s).isDirectory()) copyFolder(s, d);
    else copyFile(s, d);
  });
}

function removeFolderRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------- Inputs ----------------
const demoName = process.argv[2];
const pageTitle = process.argv[3] || "MwM Demo";

if (!demoName) {
  console.log('❌ Usage: node create-demo.js <templateName> "Page Title"');
  process.exit(1);
}

const safeDemoName = demoName.toLowerCase().replace(/\s+/g, "-");
const outDir = path.join("output", safeDemoName);

// Template directories
const TEMPLATE_DIR = path.join("templates", safeDemoName);
const BASE_DIR = path.join("templates", "base");

// ---------------- Validation ----------------
if (!fs.existsSync(TEMPLATE_DIR)) {
  console.log(`❌ Template not found: ${TEMPLATE_DIR}`);
  process.exit(1);
}

["demo.html", "demo.css", "demo.js"].forEach((file) => {
  if (!fs.existsSync(path.join(TEMPLATE_DIR, file))) {
    console.log(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
});

// Clean previous outputs
removeFolderRecursive(outDir);
ensureDir(outDir);

// ---------------- Load template HTML ----------------
let introHTML = fs.readFileSync(path.join(BASE_DIR, "intro.html"), "utf8");
let outroHTML = fs.readFileSync(path.join(BASE_DIR, "outro.html"), "utf8");
const demoHTML = fs.readFileSync(path.join(TEMPLATE_DIR, "demo.html"), "utf8");

// Inject dynamic title
introHTML = introHTML.replace(
  "</div>",
  `  <h2 class="intro-demo-name">${pageTitle}</h2>\n</div>`
);

outroHTML = outroHTML.replace(
  "</div>",
  `  <h3 class="outro-demo-name">${pageTitle}</h3>\n</div>`
);

// ---------------- Copy assets ----------------
copyFile("shared/mwm.css", path.join(outDir, "mwm.css"));
copyFile("shared/mwm_particules.js", path.join(outDir, "mwm_particules.js"));
copyFile("shared/logo_mwm.png", path.join(outDir, "logo_mwm.png"));

copyFolder(TEMPLATE_DIR, outDir);

// ---------------- Generate index.html ----------------
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

    <section class="slide active" id="intro">
      <div class="slide-inner">
${introHTML}
      </div>
    </section>

    <section class="slide" id="${safeDemoName}-demo">
${demoHTML}
    </section>

    <section class="slide" id="outro">
      <div class="slide-inner">
${outroHTML}
      </div>
    </section>

  </div>

  <script src="./mwm_particules.js"></script>
  <script src="./demo.js"></script>

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

fs.writeFileSync(path.join(outDir, "index.html"), finalHTML, "utf8");

console.log("✔ Demo generated:", outDir);
console.log("✔ Titles injected:", pageTitle);
console.log("✨ Ready to render!");
