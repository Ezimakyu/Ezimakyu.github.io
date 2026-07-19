/*
 * Robotic Zen Garden theme
 * A sand-ripple field modulated by sine waves, plus a 2-joint robotic arm
 * that follows the mouse and "rakes" the sand as it moves.
 * Click anywhere to drop a stone ripple.
 */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let time = 0;

  const mouse = { x: 0, y: 0, active: false };
  let wrist = { x: 0, y: 0 };
  let shoulder = { x: 0, y: 0 };
  let elbow = { x: 0, y: 0 };
  let ripples = [];

  const SAND = '212, 175, 55';
  const CYAN = '110, 231, 255';

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    shoulder = { x: width * 0.85, y: height * 0.9 };
    solveArm({ x: width * 0.5, y: height * 0.45 });
  }

  function solveArm(target) {
    const L1 = height * 0.22;
    const L2 = height * 0.16;
    let dx = target.x - shoulder.x;
    let dy = target.y - shoulder.y;
    let d = Math.hypot(dx, dy);

    const maxReach = L1 + L2 - 2;
    if (d > maxReach) {
      dx = (dx / d) * maxReach;
      dy = (dy / d) * maxReach;
      d = maxReach;
    }

    const baseAngle = Math.atan2(dy, dx);
    const cosB = (d * d + L1 * L1 - L2 * L2) / (2 * d * L1);
    const cosC = (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2);
    const angleB = Math.acos(Math.max(-1, Math.min(1, cosB)));
    const angleC = Math.acos(Math.max(-1, Math.min(1, cosC))) - Math.PI;

    const a1 = baseAngle - angleB;
    const a2 = a1 + angleC;

    elbow = {
      x: shoulder.x + L1 * Math.cos(a1),
      y: shoulder.y + L1 * Math.sin(a1),
    };
    wrist = {
      x: elbow.x + L2 * Math.cos(a2),
      y: elbow.y + L2 * Math.sin(a2),
    };
  }

  function displacement(x, y) {
    let d = Math.sin(x * 0.01 + time * 0.4) * 6
          + Math.sin(y * 0.015 + time * 0.2) * 3
          + Math.sin((x + y) * 0.006 + time * 0.15) * 2;

    if (mouse.active) {
      const dm = Math.hypot(x - mouse.x, y - mouse.y);
      d += Math.exp(-dm / 120) * 18 * Math.sin(dm * 0.06 - time * 2.5);
    }

    const dw = Math.hypot(x - wrist.x, y - wrist.y);
    d += Math.exp(-dw / 90) * 14 * Math.sin(dw * 0.07 - time * 3);

    ripples.forEach((r) => {
      const dr = Math.hypot(x - r.x, y - r.y);
      d += r.amp * Math.exp(-dr / r.radius) * Math.sin(dr * 0.05 - r.age * 0.25);
    });

    return d;
  }

  function drawSand() {
    const lineStep = window.matchMedia('(pointer: coarse)').matches ? 18 : 12;
    const pointStep = window.matchMedia('(pointer: coarse)').matches ? 16 : 10;

    for (let y = 0; y < height; y += lineStep) {
      ctx.beginPath();
      let started = false;
      let maxAbs = 0;
      for (let x = 0; x <= width; x += pointStep) {
        const d = displacement(x, y);
        const py = y + d;
        if (Math.abs(d) > maxAbs) maxAbs = Math.abs(d);
        if (!started) {
          ctx.moveTo(x, py);
          started = true;
        } else {
          ctx.lineTo(x, py);
        }
      }
      const alpha = 0.12 + maxAbs * 0.003;
      ctx.strokeStyle = `rgba(${SAND}, ${Math.min(0.6, alpha)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function drawArm() {
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(elbow.x, elbow.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.95)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    [shoulder, elbow, wrist].forEach((joint) => {
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(110, 231, 255, 0.95)';
      ctx.shadowColor = 'rgba(110, 231, 255, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Raker tip
    ctx.beginPath();
    ctx.arc(wrist.x, wrist.y, 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(110, 231, 255, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    time += 0.03;

    if (mouse.active) solveArm(mouse);

    drawSand();
    drawArm();

    ripples = ripples.filter((r) => {
      r.age++;
      r.amp *= 0.96;
      return r.amp > 0.2;
    });

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      amp: 28,
      radius: 180,
      age: 0,
    });
  });

  resize();
  loop();
})();
