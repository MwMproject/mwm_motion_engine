/* ============================================================
   border-style (pro) — Demo Script
   ============================================================ */

function startDemo() {
  const box = document.querySelector(".main-box");
  const className = document.querySelector(".code-classname");
  const props = document.querySelector(".code-properties");

  const styles = [
    { class: ".border-style", css: "border: 6px solid #00ff7b;" },
    { class: ".border-style", css: "border: 8px dashed #00ff7b;" },
    { class: ".border-style", css: "border: 12px double #00ff7b;" },
    { class: ".border-style", css: "border: 6px inset #00ff7b;" },
    { class: ".border-style", css: "border: 6px ridge #00ff7b;" },
  ];

  let index = 0;

  function update() {
    const item = styles[index];

    box.style.border = item.css.replace("border:", "").replace(";", "");

    className.textContent = `${item.class} {`;
    props.textContent = `    ${item.css} }`;

    // Sweep animation reset
    box.classList.remove("sweep");
    void box.offsetWidth;
    box.classList.add("sweep");

    index = (index + 1) % styles.length;
  }

  update();
  setInterval(update, 3000);
}
