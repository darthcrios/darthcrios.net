(() => {
  const canvas = document.getElementById("scopeCanvas");
  if (!canvas) {
    console.warn("scopeCanvas not found ❌");
    return;
  }

  console.log("scope.js running ✅");

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    console.log("canvas size:", W, H);
  }

  window.addEventListener("resize", resize);
  resize();

  function frame(now) {
    const t = now / 1000;

    // Background (so you ALWAYS see the drawing)
    ctx.fillStyle = "rgba(5,6,7,0.35)";
    ctx.fillRect(0, 0, W, H);

    // Grid (visible)
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y < H; y += 30) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    // Wave (BRIGHT)
    const mid = H * 0.62;
    const amp = H * 0.18;
    const freq = 3.5;
    const phase = t * 2.2;

    // glow
    ctx.strokeStyle = "rgba(162,89,255,0.30)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const n = x / W;
      const y = mid + Math.sin(n * Math.PI * 2 * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // core
    ctx.strokeStyle = "rgba(162,89,255,0.98)";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
