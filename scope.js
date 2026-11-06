
(() => {
  const canvas = document.getElementById("scopeCanvas");
  const header = document.querySelector(".scope-header");
  const preview = document.getElementById("preview");

  // Only require the canvas and header
  if (!canvas || !header) return;

  // Homepage only: move Scope into fullscreen preview
  if (preview) {
    preview.insertBefore(canvas, preview.firstChild);
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  let W = 0, H = 0;

  const root = getComputedStyle(document.documentElement);
  const bg = (root.getPropertyValue("--bg") || "#0B0B0C").trim();
  const accent = (root.getPropertyValue("--accent") || "#a259ff").trim();

  function rgba(hex, a) {
    const h = hex.replace("#", "").trim();

    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    return `rgba(255,255,255,${a})`;
  }

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;

    if (!W || !H) return;

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  window.addEventListener("resize", resize);

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas.parentElement);
  }

  resize();

  // Waveform switching
  let wave = "sine";
  let target = "sine";
  let blend = 1;

  const nav = document.querySelector(".scope-nav");

  if (nav) {
    nav.querySelectorAll("a[data-wave]").forEach(a => {
      a.addEventListener("mouseenter", () => {
        target = a.dataset.wave || "sine";
        blend = 0;
      });

      a.addEventListener("mouseleave", () => {
        target = "sine";
        blend = 0;
      });
    });
  }

  function fn(type, p) {
    switch (type) {
      case "square":
        return Math.sin(p) >= 0 ? 1 : -1;

      case "triangle": {
        const u = (p / (Math.PI * 2)) % 1;
        return 1 - 4 * Math.abs(u - 0.5);
      }

      case "saw": {
        const u = (p / (Math.PI * 2)) % 1;
        return (u * 2) - 1;
      }

      case "pulse":
        return Math.sin(p) > 0.7 ? 1 : -1;

      case "noise":
        return Math.max(-1, Math.min(
          1,
          Math.sin(p) * 0.6 + (Math.random() * 2 - 1) * 0.35
        ));

      case "sine":
      default:
        return Math.sin(p);
    }
  }

  function draw(t) {
    if (!W || !H) resize();

    if (W && H) {
      // Background persistence
      ctx.fillStyle = rgba(bg, 0.18);
      ctx.fillRect(0, 0, W, H);

      // Grid
      const grid = 22;
      const drift = (t * 18) % grid;

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
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

      // Smooth waveform blend
      if (blend < 1) blend = Math.min(1, blend + 0.10);

      const mid = H * 0.62;
      const amp = H * 0.20;
      const freq = 3.4;
      const phase = t * 2.2;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Glow
      ctx.lineWidth = 6;
      ctx.strokeStyle = rgba(accent, 0.22);
      ctx.beginPath();

      for (let x = 0; x <= W; x++) {
        const n = x / W;
        const p = n * Math.PI * 2 * freq + phase;

        const a = fn(wave, p);
        const b = fn(target, p);
        const y = mid + ((a * (1 - blend) + b * blend) * amp);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Core
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = rgba(accent, 0.98);
      ctx.stroke();

      if (blend === 1) wave = target;
    }

    requestAnimationFrame(n => draw(n / 1000));
  }

  requestAnimationFrame(n => draw(n / 1000));
})();

