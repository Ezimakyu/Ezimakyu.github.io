/*
 * Constellations theme
 * A drifting network of nodes that connect when close.
 * Mouse repels and briefly links to nearby nodes; click creates a ripple.
 */

(function () {
  const canvas = document.getElementById('demo-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let nodes = [];
  let ripples = [];

  const NODE_COUNT = window.matchMedia('(pointer: coarse)').matches ? 55 : 95;
  const CONNECTION_DIST = 140;
  const MOUSE_DIST = 220;
  const MOUSE_REPULSION = 0.35;

  const palette = ['#ffffff', '#7c5cff', '#00d4ff', '#9aa3b8'];

  const mouse = { x: -1000, y: -1000, active: false };

  class Node {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 1.5 + 1;
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.baseAlpha = Math.random() * 0.5 + 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST && dist > 0) {
          const force = (1 - dist / MOUSE_DIST) * MOUSE_REPULSION;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 2.2) {
        this.vx = (this.vx / speed) * 2.2;
        this.vy = (this.vy / speed) * 2.2;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * dpr * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.baseAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 250;
      this.alpha = 1;
      this.speed = 4;
    }

    update() {
      this.radius += this.speed;
      this.alpha = 1 - this.radius / this.maxRadius;
      return this.alpha > 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#00d4ff';
      ctx.globalAlpha = this.alpha * 0.35;
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
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
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new Node());
    }
  }

  function drawConnections() {
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
          ctx.stroke();
        }
      }

      if (mouse.active) {
        const dx = a.x - mouse.x;
        const dy = a.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST) {
          const alpha = (1 - dist / MOUSE_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.stroke();
        }
      }
    }
  }

  function drawBigDipper() {
    const cx = width * 0.75;
    const cy = height * 0.25;
    const shape = [
      [0, 0], [40, -10], [90, 5], [130, 35],
      [130, 90], [180, 100], [230, 75], [130, 35]
    ];
    ctx.beginPath();
    shape.forEach(([x, y], i) => {
      const px = cx + x;
      const py = cy + y;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    drawBigDipper();

    nodes.forEach((n) => n.update());
    drawConnections();
    nodes.forEach((n) => n.draw());

    ripples = ripples.filter((r) => {
      const alive = r.update();
      r.draw();
      return alive;
    });

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    ripples.push(new Ripple(e.clientX, e.clientY));
    nodes.forEach((n) => {
      const dx = n.x - e.clientX;
      const dy = n.y - e.clientY;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 0) {
        const force = (1 - dist / 180) * 3.5;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }
    });
  });

  resize();
  initNodes();
  loop();
})();
