(() => {
  const canvas = document.getElementById("scopeCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;

  // Pull theme colors from CSS vars (fallbacks included)
  const root = getComputedStyle(document.documentElement);
  const bg = (root.getPropertyValue("--bg") || "#050607").trim();
  const accent = (root.getPropertyValue("--accent") || "#a259ff").trim();

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function rgba(hexOrCss, a) {
    // If css var resolves to rgb()/hsl(), keep it but add alpha by converting when possible.
    if (/^rgba?\(/i.test(hexOrCss)) {
      const m = hexOrCss.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (m) return `rgba(${m[1]},${m[2]},${m[3]},${a})`;
      const mr = hexOrCss.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/i);
      if (mr) return `rgba(${mr[1]},${mr[2]},${mr[3]},${a})`;
      return hexOrCss; // fallback
    }
    const hex = hexOrCss.replace("#", "").trim();
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }
    return `rgba(255,255,255,${a})`;
  }

  // ---- Wave switching (hover nav) ----
  let waveTarget = "sine";
  let waveCurrent = "sine";
  let waveBlend = 1; // 0..1 (current->target)
  let waveBlendSpeed = 0.12;

  const nav = document.querySelector(".scope-nav");
  if (nav) {
    nav.querySelectorAll("a[data-wave]").forEach(a => {
      a.addEventListener("mouseenter", () => {
        waveTarget = a.getAttribute("data-wave") || "sine";
        waveBlend = 0;
      });
      a.addEventListener("mouseleave", () => {
        waveTarget = "sine";
        waveBlend = 0;
      });
    });
  }

  // ---- Wave functions (x in 0..1, t in seconds) => -1..1 ----
  function waveFn(type, x, t) {
    const baseFreq = 3.2;
    const wobble = 0.18 * Math.sin(t * 0.35);
    const freq = baseFreq + wobble;
    const phase = t * 2.0;

    // core phase position
    const p = (x * Math.PI * 2 * freq) + phase;

    switch (type) {
      case "square":
        return Math.sin(p) >= 0 ? 1 : -1;

      case "triangle": {
        // triangle from sine-ish phase
        // normalize to [0,1) then triangle shape
        const u = (p / (Math.PI * 2)) % 1;
        const tri = 1 - 4 * Math.abs(u - 0.5);
        return tri; // already -1..1
      }

      case "saw": {
        const u = (p / (Math.PI * 2)) % 1;
        return (u * 2) - 1;
      }

      case "pulse": {
        const s = Math.sin(p);
        return s > 0.65 ? 1 : -1;
      }

      case "noise": {
        // controlled shimmer noise (still wave-like)
        const n = Math.sin(p) * 0.55 + Math.sin(p * 3.0) * 0.25 + (Math.random() * 2 - 1) * 0.20;
        return Math.max(-1, Math.min(1, n));
      }

      case "sine":
      default:
        return Math.sin(p);
    }
  }

  function drawGrid(t) {
    const grid = 22;
    const drift = (t * 18) % grid;

    // slightly less opaque so the wave pops
    ctx.fillStyle = rgba(bg, 0.18);
    ctx.fillRect(0, 0, W, H);

    // minor grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba("#ffffff", 0.06);
    ctx.beginPath();
    for (let x = -grid; x < W + grid; x += grid) {
      const xx = x + drift;
      ctx.moveTo(xx, 0);
      ctx.lineTo(xx, H);
    }
    for (let y = -grid; y < H + grid; y += grid) {
      const yy = y + drift * 0.6;
      ctx.moveTo(0, yy);
      ctx.lineTo(W, yy);
    }
    ctx.stroke();

    // major grid
    ctx.strokeStyle = rgba("#ffffff", 0.10);
    ctx.beginPath();
    for (let x = 0; x < W + 1; x += grid * 5) {
      ctx.moveTo(x + drift * 0.35, 0);
      ctx.lineTo(x + drift * 0.35, H);
    }
    for (let y = 0; y < H + 1; y += grid * 5) {
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

    // subtle scanlines
    ctx.strokeStyle = rgba("#ffffff", 0.03);
    ctx.beginPath();
    for (let y = 0; y < H; y += 3) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  function drawWave(t) {
    const mid = H * 0.62;

    // bigger amplitude so it's obvious
    const ampBase = H * 0.20;
    const amp = ampBase * (0.90 + 0.10 * Math.sin(t * 0.9));

    // blend wave type smoothly
    if (waveBlend < 1) {
      waveBlend = Math.min(1, waveBlend + waveBlendSpeed);
      if (waveBlend === 1) waveCurrent = waveTarget;
    }
    const aType = waveCurrent;
    const bType = waveTarget;
    const k = waveBlend;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // glow underlay
    ctx.lineWidth = 6;
    ctx.strokeStyle = rgba(accent, 0.18);
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const nx = x / W;
      const ya = waveFn(aType, nx, t) * amp;
      const yb = waveFn(bType, nx, t) * amp;
      const y = mid + (ya * (1 - k) + yb * k);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // crisp core
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = rgba(accent, 0.95);
    ctx.stroke();

    // ticks
    ctx.fillStyle = rgba("#ffffff", 0.18);
    for (let i = 1; i < 6; i++) {
      const x = (W / 6) * i;
      ctx.fillRect(x, mid - 2, 1, 4);
    }
  }

  function drawHUD() {
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillStyle = rgba("#ffffff", 0.55);
    ctx.fillText(`MODE: ${waveTarget.toUpperCase()}`, 18, 26);
    ctx.fillText("TRIG: FREE", 18, 44);
    ctx.fillText("TIME: 1ms/div", 18, 62);
  }

  function frame(now) {
    const t = now / 1000;
    drawGrid(t);
    drawWave(t);
    drawHUD();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
