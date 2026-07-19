/*
 * Cyber-Cultivation theme
 * Matrix-style falling glyphs with a jade/pink palette.
 * Mouse X tilts the rain; click releases a bright scroll burst.
 */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  const FONT_SIZE = 14;
  const BASE_BG = '6,16,15';
  const CHARS = '01AQC<>{}//**::&|~アイウエオカキクケコサシスセソタチツテト';

  let columns = [];
  let wind = 0;
  let burst = 0;

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const colCount = Math.ceil(width / FONT_SIZE) + 2;
    columns = [];
    for (let i = 0; i < colCount; i++) {
      columns.push({
        x: i * FONT_SIZE,
        y: Math.random() * -height,
        speed: Math.random() * 1.2 + 0.4,
        length: Math.floor(Math.random() * 14 + 8),
        chars: Array.from({ length: 20 }, randomChar),
      });
    }
  }

  function draw() {
    ctx.fillStyle = `rgba(${BASE_BG}, ${burst > 0 ? 0.22 : 0.12})`;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';

    const headColor = burst > 0 ? '#ffe6f0' : '#ccfff2';
    const tailColor = burst > 0 ? [255, 92, 170] : [0, 212, 168];

    columns.forEach((col) => {
      const headX = col.x + wind * (col.y / height) * 80;
      const headY = col.y;

      for (let i = 0; i < col.length; i++) {
        const y = headY - i * FONT_SIZE;
        if (y < -FONT_SIZE || y > height + FONT_SIZE) continue;

        const ratio = 1 - i / col.length;
        const alpha = burst > 0
          ? Math.max(0, ratio - 0.15)
          : Math.max(0, ratio - 0.2);

        if (i === 0) {
          ctx.fillStyle = headColor;
          ctx.shadowColor = headColor;
          ctx.shadowBlur = 6;
        } else {
          const [r, g, b] = tailColor;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`;
          ctx.shadowBlur = 0;
        }

        const charIndex = (Math.floor(col.y / FONT_SIZE) - i) % col.chars.length;
        const safeIndex = ((charIndex % col.chars.length) + col.chars.length) % col.chars.length;
        const x = headX;
        ctx.fillText(col.chars[safeIndex], x, y);
      }

      col.y += col.speed * (burst > 0 ? 2.5 : 1);
      if (col.y - col.length * FONT_SIZE > height) {
        col.y = -FONT_SIZE;
        col.speed = Math.random() * 1.2 + 0.4;
        col.length = Math.floor(Math.random() * 14 + 8);
      }
    });

    if (burst > 0) burst--;
    if (wind !== 0) wind *= 0.96;

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    const center = width / 2;
    const target = (e.clientX - center) / center;
    wind += (target - wind) * 0.08;
  }, { passive: true });

  window.addEventListener('click', () => {
    burst = 30;
    columns.forEach((col) => {
      col.chars = Array.from({ length: 20 }, randomChar);
      col.speed = Math.random() * 2 + 0.8;
    });
  });

  resize();
  draw();
})();
