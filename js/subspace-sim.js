/**
 * spanlab/subspace-sim.js
 * Simulation 2: Subspace union vs algebraic sum.
 */
window.SpanLab = window.SpanLab || {};

SpanLab.createSubspaceSim = function () {
  const { fmt2 } = SpanLab.math;
  const draw = SpanLab.canvasDraw;

  const canvas = document.getElementById('subspace-canvas');
  const ctx = canvas.getContext('2d');

  let u = { x: 2, y: 0.5 };
  let w = { x: 0.5, y: 2 };
  let mode = 'union';
  let dragging = null;
  let animT = 0;

  const particles = Array.from({ length: 60 }, () => ({
    a: (Math.random() - 0.5) * 4,
    b: (Math.random() - 0.5) * 4,
    life: Math.random(),
    speed: 0.002 + Math.random() * 0.004
  }));

  function isNearHandle(px, py, vec, toScreen) {
    const p = toScreen(vec.x, vec.y);
    return Math.hypot(px - p.px, py - p.py) < 20;
  }

  function drawSumFill(toScreen) {
    const W = canvas.width;
    const H = canvas.height;

    ctx.save();
    for (let a = -3; a <= 3; a += 0.5) {
      for (let b = -3; b <= 3; b += 0.5) {
        const px = a * u.x + b * w.x;
        const py = a * u.y + b * w.y;
        const p = toScreen(px, py);
        const dist = Math.hypot(p.px - W / 2, p.py - H / 2);
        const alpha = Math.max(0, 0.15 - dist / W * 0.15);
        const hue = ((a + b) * 30 + animT * 20) % 360;
        ctx.fillStyle = `hsla(${120 + hue * 0.1}, 70%, 55%, ${alpha + 0.05})`;
        ctx.fillRect(p.px - 3, p.py - 3, 6, 6);
      }
    }

    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
    grad.addColorStop(0, 'rgba(34,197,94,0.12)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    particles.forEach(p => {
      p.life += p.speed;
      if (p.life > 1) {
        p.life = 0;
        p.a = (Math.random() - 0.5) * 4;
        p.b = (Math.random() - 0.5) * 4;
      }
      const px = p.a * u.x + p.b * w.x;
      const py = p.a * u.y + p.b * w.y;
      const c = toScreen(px, py);
      ctx.fillStyle = `rgba(34,197,94,${(1 - p.life) * 0.6})`;
      ctx.beginPath();
      ctx.arc(c.px, c.py, 2 + p.life * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawUnionHighlight(toScreen) {
    const alpha = 0.15 + Math.sin(animT * 2) * 0.08;
    ctx.save();
    ctx.globalAlpha = alpha;
    draw.drawInfiniteLine(ctx, canvas, toScreen, u, 'rgba(239,68,68,0.5)', '');
    draw.drawInfiniteLine(ctx, canvas, toScreen, w, 'rgba(239,68,68,0.5)', '');
    ctx.restore();
  }

  function isInUnion() {
    const sum = { x: u.x + w.x, y: u.y + w.y };
    const crossU = Math.abs(u.x * sum.y - u.y * sum.x);
    const crossW = Math.abs(w.x * sum.y - w.y * sum.x);
    const tol = 0.05 * Math.hypot(sum.x, sum.y);
    return crossU < tol || crossW < tol;
  }

  function updateReadouts() {
    const sum = { x: u.x + w.x, y: u.y + w.y };
    document.getElementById('vec-u').textContent = `(${fmt2(u.x)}, ${fmt2(u.y)})`;
    document.getElementById('vec-w').textContent = `(${fmt2(w.x)}, ${fmt2(w.y)})`;
    document.getElementById('vec-sum').textContent = `(${fmt2(sum.x)}, ${fmt2(sum.y)})`;

    const inUnion = isInUnion();
    const verifyBox = document.getElementById('verify-box');
    const verifyText = document.getElementById('verify-text');
    const verifyDetail = document.getElementById('verify-detail');
    const insight = document.getElementById('insight-text');

    if (mode === 'union') {
      verifyBox.className = `rounded-lg p-4 border transition-all duration-500 ${inUnion ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-neon-red/10 border-neon-red/40'}`;
      verifyText.innerHTML = inUnion
        ? '<i class="fa-solid fa-equals mr-1 text-yellow-400"></i> u + w ∈ U ∪ W ? <span class="text-yellow-400">Barely — on a line (degenerate)</span>'
        : '<i class="fa-solid fa-xmark mr-1 text-neon-red"></i> u + w ∈ U ∪ W ? <span class="text-neon-red font-bold">No!</span>';
      verifyDetail.textContent = inUnion
        ? 'Vectors are parallel — union collapses to a single line.'
        : `v = (${fmt2(sum.x)}, ${fmt2(sum.y)}) lies off both lines → not closed under addition.`;
      insight.textContent = 'The set U ∪ W contains only points lying on line U or line W. Vector addition "escapes" to the interior of the plane, violating subspace closure.';
    } else {
      verifyBox.className = 'rounded-lg p-4 border transition-all duration-500 bg-neon-green/10 border-neon-green/40';
      verifyText.innerHTML = '<i class="fa-solid fa-check mr-1 text-neon-green"></i> u + w ∈ U + W ? <span class="text-neon-green font-bold">Yes!</span>';
      verifyDetail.textContent = 'U + W = { a·u + b·w | a,b ∈ ℝ } spans all of ℝ² — a valid subspace.';
      insight.textContent = 'The sum U + W includes every linear combination a·u + b·w. Two non-parallel vectors span the entire plane, forming a closed subspace under addition and scalar multiplication.';
    }
  }

  function render() {
    animT += 0.016;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { toScreen } = draw.makeTransform(canvas);

    draw.drawGrid(ctx, canvas, toScreen);
    draw.drawVector(ctx, toScreen, { x: 0, y: 0 }, { x: 4.2, y: 0 }, 'rgba(156,163,175,0.4)', { arrow: true, width: 1, glow: false });
    draw.drawVector(ctx, toScreen, { x: 0, y: 0 }, { x: 0, y: 4.2 }, 'rgba(156,163,175,0.4)', { arrow: true, width: 1, glow: false });
    ctx.fillStyle = '#6B7280'; ctx.font = '10px JetBrains Mono';
    const ox = toScreen(4.3, 0); ctx.fillText('x', ox.px, ox.py + 4);
    const oy = toScreen(0, 4.3); ctx.fillText('y', oy.px - 12, oy.py);

    if (mode === 'sum') drawSumFill(toScreen);

    draw.drawInfiniteLine(ctx, canvas, toScreen, u, '#3B82F6', 'U = span(u)');
    draw.drawInfiniteLine(ctx, canvas, toScreen, w, '#F97316', 'W = span(w)');

    if (mode === 'union') drawUnionHighlight(toScreen);

    draw.drawVector(ctx, toScreen, { x: 0, y: 0 }, u, '#3B82F6', { width: 3 });
    draw.drawVector(ctx, toScreen, { x: 0, y: 0 }, w, '#F97316', { width: 3 });

    const sum = { x: u.x + w.x, y: u.y + w.y };
    draw.drawVector(ctx, toScreen, { x: 0, y: 0 }, sum, '#22C55E', { dashed: true, width: 3 });

    ctx.save();
    ctx.globalAlpha = 0.2;
    draw.drawVector(ctx, toScreen, u, sum, '#22C55E', { dashed: true, width: 1, arrow: false, glow: false });
    draw.drawVector(ctx, toScreen, w, sum, '#22C55E', { dashed: true, width: 1, arrow: false, glow: false });
    ctx.restore();

    draw.drawHandle(ctx, toScreen, u, '#3B82F6', 'u', dragging, animT);
    draw.drawHandle(ctx, toScreen, w, '#F97316', 'w', dragging, animT);

    const o = toScreen(0, 0);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(o.px, o.py, 4, 0, Math.PI * 2); ctx.fill();

    updateReadouts();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 32;
    canvas.height = 520;
    render();
  }

  function pointerDown(px, py) {
    const { toScreen } = draw.makeTransform(canvas);
    if (isNearHandle(px, py, u, toScreen)) dragging = 'u';
    else if (isNearHandle(px, py, w, toScreen)) dragging = 'w';
  }

  function pointerMove(px, py) {
    if (!dragging) return;
    const { toWorld } = draw.makeTransform(canvas);
    const world = toWorld(px, py);
    world.x = Math.max(-4, Math.min(4, world.x));
    world.y = Math.max(-4, Math.min(4, world.y));
    if (dragging === 'u') { u.x = world.x; u.y = world.y; }
    else { w.x = world.x; w.y = world.y; }
    render();
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerDown(e.clientX - rect.left, e.clientY - rect.top);
  });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerMove(e.clientX - rect.left, e.clientY - rect.top);
  });
  canvas.addEventListener('mouseup', () => { dragging = null; });
  canvas.addEventListener('mouseleave', () => { dragging = null; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    pointerDown(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    pointerMove(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: false });
  canvas.addEventListener('touchend', () => { dragging = null; });

  document.getElementById('mode-union').addEventListener('click', () => {
    mode = 'union';
    document.getElementById('mode-union').classList.add('active');
    document.getElementById('mode-sum').classList.remove('active');
    render();
  });
  document.getElementById('mode-sum').addEventListener('click', () => {
    mode = 'sum';
    document.getElementById('mode-sum').classList.add('active');
    document.getElementById('mode-union').classList.remove('active');
    render();
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const [ux, uy] = btn.dataset.u.split(',').map(Number);
      const [wx, wy] = btn.dataset.w.split(',').map(Number);
      u = { x: ux, y: uy };
      w = { x: wx, y: wy };
      render();
    });
  });

  function animate() {
    if (!document.getElementById('sim-subspace').classList.contains('hidden')) {
      render();
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();

  return { resize, render };
};
