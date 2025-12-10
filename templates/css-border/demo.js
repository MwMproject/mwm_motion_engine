function startDemo() {
  const box = document.querySelector(".demo-box");
  const code = document.querySelector(".demo-code");

  const styles = [
    { label: "solid", css: "6px solid #00ff7b" },
    { label: "double", css: "12px double #00ff7b" },
    { label: "dashed", css: "6px dashed #00ff7b" },
    { label: "inset", css: "6px inset #00ff7b" },
  ];

  let i = 0;

  function update() {
    const s = styles[i];

    box.style.border = s.css;
    code.textContent = `.border-style {
  border: ${s.css};
}`;

    i = (i + 1) % styles.length;
  }

  update();
  setInterval(update, 3500);
}
