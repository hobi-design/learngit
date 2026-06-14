/**
 * pixel-transition.js
 *
 * Scroll-driven pixel grid that transitions from --color-surface to --color-base
 * as the panel scrolls through the viewport.
 *
 * Usage:
 *   PixelTransition.init(containerId, canvasId, options)
 *
 * Options:
 *   cellSize       — pixel cell size in px (default: 96)
 *   noiseIntensity — stochastic scatter 0–1 (default: 0.85)
 *   colorTop       — hex color of filled cells (default: '#141414')
 *   colorBottom    — hex color of canvas background (default: '#0c0c0c')
 */

const PixelTransition = (() => {

  function init(containerId, canvasId, opts = {}) {
    const container = document.getElementById(containerId);
    const canvas    = document.getElementById(canvasId);
    if (!container || !canvas) return;

    const ctx           = canvas.getContext('2d');
    const cellSize      = opts.cellSize      ?? 96;
    const noiseIntensity= opts.noiseIntensity?? 0.85;
    const colorTop      = opts.colorTop      ?? '#141414';
    const colorBottom   = opts.colorBottom   ?? '#0c0c0c';

    let cells = [], cols = 0, rows = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w   = window.innerWidth;
      const h   = container.clientHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      cols = Math.ceil(w / cellSize);
      rows = Math.ceil(h / cellSize);
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x:     c * cellSize,
            y:     r * cellSize,
            r,
            noise: Math.random() - 0.5,
            state: 1,
          });
        }
      }
    }

    function render() {
      const rect     = container.getBoundingClientRect();
      const vh       = window.innerHeight;
      let   progress = (vh - rect.top) / (vh + rect.height);
      progress       = Math.max(0, Math.min(1, progress));

      ctx.fillStyle = colorBottom;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const threshold = (1 - progress) * 1.5 - 0.25;

      cells.forEach(cell => {
        const yn     = cell.r / rows;
        const target = threshold + cell.noise * noiseIntensity > yn ? 1 : 0;
        cell.state  += (target - cell.state) * 0.15;
        if (cell.state > 0.01) {
          ctx.fillStyle   = colorTop;
          ctx.globalAlpha = Math.min(1, cell.state);
          ctx.fillRect(cell.x, cell.y, cellSize + 0.5, cellSize + 0.5);
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    resize();
    render();
  }

  return { init };
})();
