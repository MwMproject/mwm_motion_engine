/**
 * ============================================================
 * MwM UNIVERSAL DEMO ENGINE — BORDER STYLE
 * ============================================================
 */

function startDemo() {
  const box = document.querySelector(".border-box");
  const label = document.querySelector(".border-label");
  const code = document.getElementById("codeDisplay");

  if (!box || !label || !code) return;

  // ⏱ TEMPO GLOBAL
  const STEP_DURATION = 2600;

  // 🔁 STATES
  const STEPS = [
    { name: "solid", css: "border: 6px solid #00ff7b;" },
    { name: "dashed", css: "border: 6px dashed #00ff7b;" },
    { name: "double", css: "border: 10px double #00ff7b;" },
    { name: "ridge", css: "border: 6px ridge #00ff7b;" },
    { name: "inset", css: "border: 6px inset #00ff7b;" },
    { name: "groove", css: "border: 6px groove #00ff7b;" },
    { name: "dotted", css: "border: 6px dotted #00ff7b;" },
    { name: "outset", css: "border: 6px outset #00ff7b;" },
    { name: "none", css: "border: none;" },
  ];

  let index = 0;

  function applyStep() {
    const step = STEPS[index];

    label.textContent = step.name;
    code.textContent = "";

    typeCode(step.css, () => {
      box.style.cssText = step.css;

      box.classList.remove("sweep");
      void box.offsetWidth;
      box.classList.add("sweep");
    });

    index = (index + 1) % STEPS.length;
  }

  function typeCode(text, done) {
    let i = 0;
    const speed = 22;

    const interval = setInterval(() => {
      code.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (done) done();
      }
    }, speed);
  }

  applyStep();
  setInterval(applyStep, STEP_DURATION);
}
