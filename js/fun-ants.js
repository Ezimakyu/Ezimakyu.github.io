/*
 * Ant Colony on an Expander
 * Ants traverse a sparse, highly-connected graph, depositing potential on
 * the edges they use. Potential decays over time. The source is labelled
 * "You in the present"; the destination is "Your best possible future".
 */

(function () {
  const canvas = document.getElementById('demo-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  const NODE_COUNT = 40;
  const NEIGHBORS = 3;
  const ANT_COUNT = 35;
  const DECAY = 0.985;
  const DEPOSIT = 0.18;
  const MOUSE_BOOST = 0.25;
  const BASE_SPEED = 2.2;

  let nodes = [];
  let edges = [];
  let ants = [];
  const adjacency = [];

  const mouse = { x: -1000, y: -1000, active: false };

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
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

    buildGraph();
  }

  function buildGraph() {
    nodes = [];
    edges = [];
    ants = [];
    for (let i = 0; i < NODE_COUNT; i++) adjacency[i] = [];

    const marginX = width * 0.12;
    const marginY = height * 0.15;

    // Source and destination pinned to left/right
    nodes.push({ x: marginX, y: height * 0.5, label: 'You in the present', isSource: true });
    nodes.push({ x: width - marginX, y: height * 0.5, label: 'Your best possible future', isDest: true });

    for (let i = 2; i < NODE_COUNT; i++) {
      nodes.push({
        x: marginX + Math.random() * (width - 2 * marginX),
        y: marginY + Math.random() * (height - 2 * marginY),
        label: null,
        isSource: false,
        isDest: false,
      });
    }

    // Connect each node to its k nearest neighbors (undirected)
    for (let i = 0; i < NODE_COUNT; i++) {
      const others = nodes
        .map((n, idx) => ({ idx, d: dist(nodes[i], n) }))
        .filter((o) => o.idx !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, NEIGHBORS + (i < 2 ? 3 : 0));

      others.forEach((o) => {
        if (i < o.idx) {
          edges.push({
            from: i,
            to: o.idx,
            potential: 0,
            distance: o.d,
          });
          const idx = edges.length - 1;
          adjacency[i].push(idx);
          adjacency[o.idx].push(idx);
        }
      });
    }

    for (let i = 0; i < ANT_COUNT; i++) {
      ants.push({
        current: 0,
        edgeIndex: -1,
        progress: 0,
        target: 0,
      });
      pickNext(ants[i]);
    }
  }

  function pickNext(ant) {
    const candidates = adjacency[ant.current];
    if (!candidates.length) return;

    // Avoid immediately reversing direction
    const currentEdge = ant.edgeIndex >= 0 ? edges[ant.edgeIndex] : null;
    const scores = candidates.map((ei) => {
      const e = edges[ei];
      const nextNode = e.from === ant.current ? e.to : e.from;
      if (currentEdge) {
        const prev = currentEdge.from === ant.current ? currentEdge.to : currentEdge.from;
        if (nextNode === prev) return 0.05;
      }
      return Math.pow(e.potential + 0.08, 1.8);
    });

    const total = scores.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let chosen = candidates[0];
    for (let i = 0; i < candidates.length; i++) {
      r -= scores[i];
      if (r <= 0) {
        chosen = candidates[i];
        break;
      }
    }

    ant.edgeIndex = chosen;
    ant.progress = 0;
  }

  function getEdgePos(edge, t) {
    const a = nodes[edge.from];
    const b = nodes[edge.to];
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  function boostEdge(edge) {
    edge.potential = Math.min(edge.potential + DEPOSIT, 1);
  }

  function update() {
    // Decay potentials
    edges.forEach((e) => {
      e.potential *= DECAY;
    });

    // Mouse influence
    if (mouse.active) {
      edges.forEach((e) => {
        const p = getEdgePos(e, 0.5);
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 160) {
          e.potential = Math.min(e.potential + MOUSE_BOOST * (1 - d / 160), 1);
        }
      });
    }

    // Move ants
    ants.forEach((ant) => {
      const e = edges[ant.edgeIndex];
      if (!e) {
        pickNext(ant);
        return;
      }

      const speed = BASE_SPEED / Math.max(20, e.distance);
      ant.progress += speed;

      if (ant.progress >= 1) {
        ant.current = e.from === ant.current ? e.to : e.from;
        boostEdge(e);

        if (nodes[ant.current].isDest) {
          // Reached the future — start over from the present
          ant.current = 0;
        }
        pickNext(ant);
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Edges
    edges.forEach((e) => {
      const a = nodes[e.from];
      const b = nodes[e.to];
      const alpha = 0.05 + e.potential * 0.55;
      const r = Math.round(124 + (0 - 124) * e.potential);
      const g = Math.round(92 + (212 - 92) * e.potential);
      const bColor = Math.round(255 + (0 - 255) * e.potential);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${bColor}, ${alpha})`;
      ctx.lineWidth = 1 + e.potential * 3;
      ctx.stroke();
    });

    // Nodes
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.isSource || n.isDest ? 8 : 4, 0, Math.PI * 2);
      ctx.fillStyle = n.isSource ? '#ffffff' : n.isDest ? '#7c5cff' : 'rgba(154, 163, 184, 0.6)';
      ctx.shadowColor = n.isSource || n.isDest ? ctx.fillStyle : 'transparent';
      ctx.shadowBlur = n.isSource || n.isDest ? 12 : 0;
      ctx.globalAlpha = n.isSource || n.isDest ? 1 : 0.7;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (n.label) {
        ctx.font = '600 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = n.isSource ? '#ffffff' : '#00d4ff';
        ctx.globalAlpha = 0.85;
        ctx.fillText(n.label, n.x, n.y + 16);
        ctx.globalAlpha = 1;
      }
    });

    // Ants
    ants.forEach((ant) => {
      const e = edges[ant.edgeIndex];
      if (!e) return;
      const p = getEdgePos(e, ant.progress);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('click', (e) => {
    edges.forEach((edge) => {
      const p = getEdgePos(edge, 0.5);
      const d = Math.hypot(p.x - e.clientX, p.y - e.clientY);
      if (d < 220) {
        edge.potential = Math.min(edge.potential + 0.5 * (1 - d / 220), 1);
      }
    });
  });

  resize();
  loop();
})();
