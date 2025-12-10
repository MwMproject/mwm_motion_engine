/* MwM PROJECT — SLOW NEBULA FOG */

const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  /* NEBULA FOG CONFIGURATION */

  const fogLayers = [
    {
      color: "rgba(0, 255, 123, 0.05)",
      scale: 1.4,
      speedX: 0.006,
      speedY: 0.004,
      offsetX: Math.random() * 1000,
      offsetY: Math.random() * 1000,
    },
    {
      color: "rgba(0, 255, 123, 0.035)",
      scale: 1.7,
      speedX: -0.004,
      speedY: 0.005,
      offsetX: Math.random() * 1000,
      offsetY: Math.random() * 1000,
    },
    {
      color: "rgba(0, 255, 123, 0.025)",
      scale: 2.2,
      speedX: 0.002,
      speedY: -0.003,
      offsetX: Math.random() * 1000,
      offsetY: Math.random() * 1000,
    },
  ];

  /* GENERATE A NOISE TEXTURE */

  function generateNoiseTexture(size = 512) {
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = noiseCanvas.height = size;
    const nctx = noiseCanvas.getContext("2d");

    const imageData = nctx.createImageData(size, size);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255; // white noise
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }

    nctx.putImageData(imageData, 0, 0);
    return noiseCanvas;
  }

  const noiseTexture = generateNoiseTexture();

  /* RENDER LOOP */

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fogLayers.forEach((fog) => {
      fog.offsetX += fog.speedX;
      fog.offsetY += fog.speedY;

      const w = canvas.width * fog.scale;
      const h = canvas.height * fog.scale;

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";

      ctx.filter = "blur(120px)";

      ctx.drawImage(noiseTexture, fog.offsetX, fog.offsetY, w, h);

      ctx.fillStyle = fog.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    });

    requestAnimationFrame(render);
  }

  render();
}
