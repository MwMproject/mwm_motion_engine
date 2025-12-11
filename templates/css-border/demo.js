/* ============================================================
   BORDER STYLE PRO — Animation + Typing Code
   Compatible Demo Engine V3
   ============================================================ */

function startDemo() {
  const box = document.querySelector(".main-box");
  const label = document.querySelector(".border-label");
  const codeDisplay = document.getElementById("codeDisplay");

  if (!box || !label || !codeDisplay) {
    console.warn("❌ Border Style: missing elements.");
    return;
  }

  const styles = [
    { name: "solid", css: "border: 12px solid #00ff7b;" },
    { name: "dashed", css: "border: 12px dashed #00ff7b;" },
    { name: "double", css: "border: 18px double #00ff7b;" },
    { name: "inset", css: "border: 12px inset #00ff7b;" },
    { name: "ridge", css: "border: 12px ridge #00ff7b;" },
  ];

  let index = 0;
  let typingInterval = null;

  function typeCode(text) {
    clearInterval(typingInterval);

    let i = 0;
    codeDisplay.textContent = "";

    typingInterval = setInterval(() => {
      codeDisplay.textContent = text.slice(0, i);
      i++;

      if (i > text.length) clearInterval(typingInterval);
    }, 18); // animation typing rapide mais lisible
  }

  function update() {
    const s = styles[index];

    label.textContent = s.name;
    box.style.border = s.css.replace("border:", "").replace(";", "");

    // Sweep FX
    box.classList.remove("sweep");
    void box.offsetWidth;
    box.classList.add("sweep");

    const codeBlock = `.border-style {
  ${s.css}
}`;

    typeCode(codeBlock);

    index = (index + 1) % styles.length;
  }

  update();
  setInterval(update, 3500);
}
