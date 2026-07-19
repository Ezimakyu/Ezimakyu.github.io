/*
 * Hero background: a subtle Vision-Language-Action (VLA) loop.
 * Three satellites orbit a central agent node; a small particle travels
 * the loop to show perception, language, and action feeding each other.
 */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let cx, cy, radius;
  let time = 0;
  let particleT = 0;

  const NODE_RADIUS = 7;
  const PARTICLE_RADIUS = 4;

  const labels = ['Vision', 'Language', 'Action'];
  const nodeColors = ['#00d4ff', '#7c5cff', '#ffffff'];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    cx = width * 0.5;
    cy = height * 0.68;
    radius = Math.min(width, height) * 0.18;
  }

  function getSatellite(i) {
    const angle = time * 0.15 + (i * 2 * Math.PI) / 3 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      color: nodeColors[i],
      label: labels[i],
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getParticle(sats) {
    const segment = Math.floor(particleT) % 3;
    const localT = particleT - Math.floor(particleT);
    const a = sats[segment];
    const b = sats[(segment + 1) % 3];
    return {
      x: lerp(a.x, b.x, localT),
      y: lerp(a.y, b.y, localT),
      color: a.color,
    };
  }

  function drawNode(x, y, color, label) {
    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(240, 242, 255, 0.55)';
    ctx.globalAlpha = 0.7;
    ctx.fillText(label, x, y + NODE_RADIUS + 10);
    ctx.globalAlpha = 1;
  }

  function drawConnection(a, b, alpha) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    time += 0.004;
    particleT += 0.006;
    if (particleT >= 3) particleT -= 3;

    const sats = [0, 1, 2].map(getSatellite);

    // Edges of the VLA triangle
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 3; i++) {
      drawConnection(sats[i], sats[(i + 1) % 3], 0.25);
      drawConnection(sats[i], { x: cx, y: cy }, 0.18);
    }

    // Central agent node
    ctx.beginPath();
    ctx.arc(cx, cy, NODE_RADIUS * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.fill();

    // Satellites
    sats.forEach((s) => drawNode(s.x, s.y, s.color, s.label));

    // Traveling particle
    const p = getParticle(sats);
    ctx.beginPath();
    ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });

  resize();
  loop();
})();
