(() => {
  const canvas = document.getElementById("scopeCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;

  // Theme colors from CSS variables (fallbacks included)
  const root = getComputedStyle(document.documentElement);
  const bg = (root.getPropertyValue("--bg") || "#050607").trim();
  const accent = (root.getPropertyValue("--accent") || "#a259ff").trim();

  function resize(){
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function rgba(hexOrCss, a){
    if (/^rgba?\(|^hsla?\(/i.test(hexOrCss)) return hexOrCss;
    const hex = hexOrCss.replace("#","").trim();
    if (hex.length === 6){
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }
    return `rgba(255,255,255,${a})`;
  }

  function drawGrid(t){
    const grid = 22;
    const drift = (t * 18) % grid;

    // persistence fade
    ctx.fillStyle = rgba(bg, 0.22);
    ctx.fillRect(0, 0, W, H);

    // minor grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba("#ffffff", 0.06);
    ctx.beginPath();
    for (let x = -grid; x < W + grid; x += grid){
      const xx = x + drift;
      ctx.moveTo(xx, 0);
      ctx.lineTo(xx, H);
    }
    for (let y = -grid; y < H + grid; y += grid){
      const yy = y + drift * 0.6;
      ctx.moveTo(0, yy);
      ctx.lineTo(W, yy);
    }
    ctx.stroke();

    // major grid
    ctx.strokeStyle = rgba("#ffffff", 0.10);
    ctx.beginPath();
    for (let x = 0; x < W + 1; x += grid * 5){
      ctx.moveTo(x + drift * 0.35, 0);
      ctx.lineTo(x + drift * 0.35, H);
    }
    for (let y = 0; y < H + 1; y += grid * 5){
      ctx.moveTo(0, y + drift * 0.22);
      ctx.lineTo(W, y + drift * 0.22);
    }
    ctx.stroke();

    // scan beam
    const scanY = (t * 120) % (H + 60) - 60;
    const beamH = 90;
    const grad = ctx.createLinearGradient(0, scanY, 0, scanY + beamH);
    grad.addColorStop(0, rgba("#ffffff", 0));
    grad.addColorStop(0.5, rgba("#ffffff", 0.08));
    grad.addColorStop(1, rgba("#ffffff", 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY, W, beamH);

    // subtle horizontal scanlines
    ctx.strokeStyle = rgba("#ffffff", 0.03);
    ctx.beginPath();
    for (let y = 0; y < H; y += 3){
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  function drawWave(t){
    const mid = H * 0.62;

    // Always a sine wave; gentle “alive” motion
    const ampBase = H * 0.18;
    const amp = ampBase * (0.85 + 0.15 * Math.sin(t * 0.9));
    const freq = 3.2 + 0.2 * Math.sin(t * 0.35);
    const phase = t * 2.0;

    // glow underlay
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = rgba(accent, 0.16);
    ctx.beginPath();
    for (let x = 0; x <= W; x++){
      const n = x / W;
      const y = mid + Math.sin((n * Math.PI * 2 * freq) + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // crisp core
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = rgba(accent, 0.95);
    ctx.stroke();

    // center tick markers
    ctx.fillStyle = rgba("#ffffff", 0.16);
    for (let i = 1; i < 6; i++){
      const x = (W / 6) * i;
      ctx.fillRect(x, mid - 2, 1, 4);
    }
  }

  function drawHUD(){
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillStyle = rgba("#ffffff", 0.55);
    ctx.fillText("MODE: SINE", 18, 26);
    ctx.fillText("TRIG: FREE", 18, 44);
    ctx.fillText("TIME: 1ms/div", 18, 62);
  }

  function frame(now){
    const t = now / 1000;
    drawGrid(t);
    drawWave(t);
    drawHUD();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();