/*
 * Subtle animated gradient mesh behind the hero.
 * Lightweight: a few radial gradients drifting on a canvas.
 */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let dpr = window.devicePixelRatio || 1;

  const blobs = [
    { x: 0.25, y: 0.3, r: 0.35, color: 'rgba(124, 92, 255, 0.22)', dx: 0.0004, dy: 0.0003 },
    { x: 0.75, y: 0.6, r: 0.45, color: 'rgba(0, 212, 255, 0.14)', dx: -0.0003, dy: 0.0004 },
    { x: 0.5, y: 0.8, r: 0.3, color: 'rgba(124, 92, 255, 0.12)', dx: 0.0002, dy: -0.00025 },
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    blobs.forEach((b) => {
      b.x += b.dx;
      b.y += b.dy;

      if (b.x < -0.2 || b.x > 1.2) b.dx *= -1;
      if (b.y < -0.2 || b.y > 1.2) b.dy *= -1;

      const px = b.x * width;
      const py = b.y * height;
      const radius = Math.max(width, height) * b.r;

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, b.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();
