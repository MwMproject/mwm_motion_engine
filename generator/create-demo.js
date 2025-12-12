const fs = require("fs");
const path = require("path");

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
    fs.statSync(s).isDirectory() ? copyFolder(s, d) : copyFile(s, d);
  });
}

const demoName = process.argv[2];
const pageTitle = process.argv[3] || "MwM Demo";
if (!demoName) {
  console.log(
    'Usage: node generator/create-demo.js <templateName> "Page Title"'
  );
  process.exit(1);
}

const safeDemoName = demoName.toLowerCase().replace(/\s+/g, "-");
const outDir = path.join("output", safeDemoName);
const TEMPLATE_DIR = path.join("templates", safeDemoName);
const BASE_DIR = path.join("templates", "base");

if (!fs.existsSync(TEMPLATE_DIR)) {
  console.log("Template not found:", TEMPLATE_DIR);
  process.exit(1);
}
["demo.html", "demo.css", "demo.js"].forEach((f) => {
  if (!fs.existsSync(path.join(TEMPLATE_DIR, f))) {
    console.log("Missing file:", f);
    process.exit(1);
  }
});

// clean output
fs.rmSync(outDir, { recursive: true, force: true });
ensureDir(outDir);

// load base
let introHTML = fs.readFileSync(path.join(BASE_DIR, "intro.html"), "utf8");
const outroHTML = fs.readFileSync(path.join(BASE_DIR, "outro.html"), "utf8");
const demoHTML = fs.readFileSync(path.join(TEMPLATE_DIR, "demo.html"), "utf8");

// inject title in intro (only)
introHTML = introHTML.replace(
  "</div>",
  `  <h2 class="intro-demo-name">${pageTitle}</h2>\n</div>`
);

// copy assets
copyFolder("shared", outDir);
copyFolder(TEMPLATE_DIR, outDir);

const finalHTML = `
<!doctype html>
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

  <section class="slide" id="demo">
    <div class="slide-inner">
      ${demoHTML}
    </div>
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
(function(){
  const INTRO_MS = 3000;
  const DEMO_MS  = 24000;
  const OUTRO_MS = 3000;

  let demoStarted = false;

  function setSlide(id){
    document.querySelectorAll(".slide").forEach(s=>s.classList.remove("active"));
    const el = document.getElementById(id);
    if(el) el.classList.add("active");

    if(id==="demo" && !demoStarted && typeof window.startDemo==="function"){
      demoStarted = true;
      window.startDemo();
    }
  }

  window.setSlide = setSlide;

  document.addEventListener("DOMContentLoaded", ()=>{
    const isRendering = window.__MWM_RENDERING__ === true;
    if(isRendering){
      setSlide("intro");
      return;
    }

    // autoplay preview
    setSlide("intro");
    setTimeout(()=>setSlide("demo"), INTRO_MS);
    setTimeout(()=>setSlide("outro"), INTRO_MS + DEMO_MS);
  });
})();
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(outDir, "index.html"), finalHTML.trim(), "utf8");
console.log("✔ Demo generated:", outDir);
