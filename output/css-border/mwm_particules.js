// ============================================================
// MwM CYBER PARTICLES — Green Matrix Rain
// ============================================================

const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const COUNT = 150;
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.4 + Math.random() * 1.2,
      size: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.y -= p.speed;
      if (p.y < 0) p.y = canvas.height;

      ctx.fillStyle = `rgba(0,255,123,${p.alpha})`;
      ctx.fillRect(p.x, p.y, 2, p.size * 5);
    });

    requestAnimationFrame(draw);
  }

  draw();
}
