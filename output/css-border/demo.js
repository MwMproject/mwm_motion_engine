/* ============================================================
   BORDER STYLE PRO — Typewriter + Style Switcher
   ============================================================ */

function startDemo() {
  const box = document.querySelector(".main-box");
  const codeBlock = document.querySelector(".demo-code");

  if (!box || !codeBlock) {
    console.warn("❌ Elements missing in demo.");
    return;
  }

  // Styles à afficher
  const styles = [
    { name: "solid", css: "border: 6px solid #00ff7b;" },
    { name: "dashed", css: "border: 6px dashed #00ff7b;" },
    { name: "double", css: "border: 12px double #00ff7b;" },
    { name: "inset", css: "border: 6px inset #00ff7b;" },
    { name: "ridge", css: "border: 6px ridge #00ff7b;" },
  ];

  let index = 0;

  // Effet machine à écrire
  function typewriter(text, speed = 25) {
    return new Promise((resolve) => {
      codeBlock.textContent = "";
      let i = 0;

      function type() {
        codeBlock.textContent = text.slice(0, i);
        i++;

        if (i <= text.length) {
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }

      type();
    });
  }

  async function runCycle() {
    const s = styles[index];
    const codeText = `.border-box {\n  ${s.css}\n}`;

    // Effet machine à écrire
    await typewriter(codeText, 18);

    // Appliquer style
    box.style.border = s.css.replace("border:", "").replace(";", "");

    // Glossy sweep
    box.classList.remove("sweep");
    void box.offsetWidth;
    box.classList.add("sweep");

    // Pause avant style suivant
    setTimeout(() => {
      index = (index + 1) % styles.length;
      runCycle();
    }, 1500);
  }

  // Lancer la boucle
  runCycle();
}
