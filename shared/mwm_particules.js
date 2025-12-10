// ============================================================
// MwM — CYBER PARTICLES v2 (Vertical Energy Stream)
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

  const COUNT = 70;
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.6 + Math.random() * 1.2,
      length: 10 + Math.random() * 18,
      alpha: 0.15 + Math.random() * 0.3,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.y -= p.speed;

      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }

      // pulsation (respiration laser)
      p.pulse += 0.05;
      const glow = p.alpha + Math.sin(p.pulse) * 0.1;

      // vertical cyber line
      const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.length);
      gradient.addColorStop(0, `rgba(0,255,123,${glow})`);
      gradient.addColorStop(1, `rgba(0,255,123,0)`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.length);
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  draw();
}
