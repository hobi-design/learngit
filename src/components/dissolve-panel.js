/**
 * dissolve-panel.js
 *
 * Hover-triggered pixel-dissolve reveal for diagram panels.
 * On mouseenter: overlay dissolves away to reveal the SVG below.
 * On mouseleave: overlay instantly fills back.
 *
 * Usage:
 *   DissolvePanel.init(panelId, canvasId, labelId, options)
 *
 * Options:
 *   pixelSize    — dissolve tile size in px (default: 22)
 *   overlayColor — fill color of the overlay (default: '#1c1c1c', = --color-surface-raised)
 *   delay        — ms delay before dissolve begins on hover (default: 60)
 *   duration     — ms for full dissolve animation (default: 450)
 */

const DissolvePanel = (() => {

  function init(panelId, canvasId, labelId, opts = {}) {
    const panel  = document.getElementById(panelId);
    const canvas = document.getElementById(canvasId);
    const label  = labelId ? document.getElementById(labelId) : null;
    if (!panel || !canvas) return;

    const ctx          = canvas.getContext('2d');
    const pixelSize    = opts.pixelSize    ?? 22;
    const overlayColor = opts.overlayColor ?? '#1c1c1c'; /* --color-surface-raised */
    const delay        = opts.delay        ?? 60;
    const duration     = opts.duration     ?? 450;

    const W = 520, H = 200;
    canvas.width  = W;
    canvas.height = H;

    let raf, timer, hovered = false;

    function fill() {
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, W, H);
      if (label) label.style.opacity = '1';
    }

    fill(); /* Start fully covered */

    panel.addEventListener('mouseenter', () => {
      hovered = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      if (label) label.style.opacity = '0';
      fill(); /* reset to full before animation */

      timer = setTimeout(() => {
        if (!hovered) return;

        const cols   = Math.ceil(W / pixelSize);
        const rows   = Math.ceil(H / pixelSize);
        const total  = cols * rows;
        /* Build an index array and shuffle it (Fisher-Yates) */
        const blocks = Array.from({ length: total }, (_, i) => i);
        for (let i = blocks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }

        const start  = performance.now();
        let   cleared = 0;

        function step(ts) {
          if (!hovered) return;
          const t      = Math.min((ts - start) / duration, 1);
          const ease   = 1 - Math.pow(1 - t, 3);   /* ease-out cubic */
          const target = Math.floor(total * ease);

          while (cleared < target && cleared < total) {
            const idx = blocks[cleared];
            const cx  = (idx % cols) * pixelSize;
            const cy  = Math.floor(idx / cols) * pixelSize;
            /* Clear with slight overlap to avoid hairline seams */
            ctx.clearRect(cx - 1, cy - 1, pixelSize + 2, pixelSize + 2);
            cleared++;
          }

          if (t < 1 && hovered) {
            raf = requestAnimationFrame(step);
          } else if (t >= 1) {
            ctx.clearRect(0, 0, W, H); /* fully transparent */
          }
        }

        raf = requestAnimationFrame(step);
      }, delay);
    });

    panel.addEventListener('mouseleave', () => {
      hovered = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      fill();
    });
  }

  return { init };
})();
