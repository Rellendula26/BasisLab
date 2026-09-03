/**
 * spanlab/pivot-sim.js
 * Simulation 1: LU vs PLU — the bad pivot disaster.
 */
window.SpanLab = window.SpanLab || {};

SpanLab.createPivotSim = function () {
  const { round3, fmt3, sliderToEps, trueSolution, relError } = SpanLab.math;

  const canvas = document.getElementById('pivot-canvas');
  const ctx = canvas.getContext('2d');
  const epsSlider = document.getElementById('eps-slider');

  let epsilon = 0.001;
  let viewMode = 'both';
  let pulseT = 0;
  let lastEps = null;
  const luTrail = [];
  const maxTrail = 48;

  function luNoPivot(eps) {
    const trace = [];
    trace.push({ type: 'header', text: '▸ Pure LU (no pivoting)' });
    trace.push({ type: 'step', text: `A = [ ${fmt3(eps)}  1 ;  1  1 ],  b = [1, 2]ᵀ` });

    const m = round3(1 / eps);
    trace.push({ type: 'warn', text: `m = round₃(1/ε) = round₃(${fmt3(1 / eps)}) = ${fmt3(m)}` });

    const newA21 = round3(1 - m * eps);
    const newA22 = round3(1 - m);
    const newB2 = round3(2 - m);
    trace.push({ type: 'step', text: `R₂ ← R₂ − m·R₁  →  pivot a₂₂ = round₃(1 − m·ε) = ${fmt3(newA21)}` });
    trace.push({ type: 'step', text: `             a₂₂ = round₃(1 − m) = ${fmt3(newA22)},  b₂ = ${fmt3(newB2)}` });

    let x2;
    if (Math.abs(newA22) < 1e-15) {
      trace.push({ type: 'fail', text: '⚠ Catastrophic: pivot ≈ 0 — division unstable' });
      x2 = round3(newB2 / (newA22 || 1e-30));
    } else {
      x2 = round3(newB2 / newA22);
    }
    trace.push({ type: 'step', text: `Back-sub: x₂ = round₃(${fmt3(newB2)}/${fmt3(newA22)}) = ${fmt3(x2)}` });

    const x1 = Math.abs(eps) < 1e-15 ? 0 : round3((1 - x2) / eps);
    trace.push({ type: 'step', text: `         x₁ = round₃((1 − x₂)/ε) = round₃(${fmt3(1 - x2)}/${fmt3(eps)}) = ${fmt3(x1)}` });

    if (Math.abs(newA21) < 0.01) {
      trace.push({ type: 'fail', text: '💥 Rounding erased ε-data: (1−m·ε) → 0, back-sub annihilates x₁' });
    }

    return { x1, x2, trace };
  }

  function pluSolve(eps) {
    const trace = [];
    trace.push({ type: 'header', text: '▸ PLU (partial pivoting)' });
    trace.push({ type: 'step', text: `|a₁₁|=|ε|=${fmt3(Math.abs(eps))} < |a₂₁|=1  →  swap R₁↔R₂` });
    trace.push({ type: 'step', text: `After swap: [ 1  1 | 2 ]  /  [ ${fmt3(eps)}  1 | 1 ]` });

    const m = round3(eps);
    const newA22 = round3(1 - m);
    const newB2 = round3(1 - 2 * m);
    trace.push({ type: 'step', text: `m = round₃(ε/1) = ${fmt3(m)}` });
    trace.push({ type: 'step', text: `R₂ ← R₂ − m·R₁  →  pivot = round₃(1−ε) = ${fmt3(newA22)}` });

    const x2 = round3(newB2 / newA22);
    const x1 = round3(2 - x2);
    trace.push({ type: 'ok', text: `x₂ = ${fmt3(x2)},  x₁ = round₃(2−x₂) = ${fmt3(x1)}  ✓ stable` });

    return { x1, x2, trace };
  }

  function renderTrace(traces) {
    const box = document.getElementById('trace-box');
    const colors = {
      header: 'text-neon-cyan', step: 'text-gray-300', warn: 'text-yellow-400',
      fail: 'text-neon-red', ok: 'text-neon-green'
    };
    box.innerHTML = traces.flatMap(t => t.trace).map(line =>
      `<div class="trace-line ${colors[line.type] || 'text-gray-300'} pl-2 border-l-2 ${
        line.type === 'fail' ? 'border-neon-red bg-neon-red/5' :
        line.type === 'ok' ? 'border-neon-green' :
        line.type === 'warn' ? 'border-yellow-400' :
        line.type === 'header' ? 'border-neon-cyan font-semibold mt-2' : 'border-lab-border'
      } py-1">${line.text}</div>`
    ).join('');
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 32;
    canvas.height = 420;
  }

  function drawPivotPlot(truth, lu, plu) {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pad = 50;
    const allX = [truth.x1, lu.x1, plu.x1, 0, 1.5];
    const allY = [truth.x2, lu.x2, plu.x2, 0, 1.5];
    let minX = Math.min(...allX) - 0.3;
    let maxX = Math.max(...allX) + 0.3;
    let minY = Math.min(...allY) - 0.3;
    let maxY = Math.max(...allY) + 0.3;
    minX = Math.min(minX, -0.5); maxX = Math.max(maxX, 2);
    minY = Math.min(minY, -0.5); maxY = Math.max(maxY, 2);

    const sx = x => pad + (x - minX) / (maxX - minX) * (W - 2 * pad);
    const sy = y => H - pad - (y - minY) / (maxY - minY) * (H - 2 * pad);

    ctx.strokeStyle = 'rgba(59,130,246,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const gx = pad + i * (W - 2 * pad) / 8;
      const gy = pad + i * (H - 2 * pad) / 8;
      ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, H - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(W - pad, gy); ctx.stroke();
    }

    if (minX <= 0 && maxX >= 0) {
      ctx.strokeStyle = 'rgba(156,163,175,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), H - pad); ctx.stroke();
    }
    if (minY <= 0 && maxY >= 0) {
      ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(W - pad, sy(0)); ctx.stroke();
    }

    ctx.fillStyle = '#6B7280'; ctx.font = '10px JetBrains Mono';
    ctx.fillText('x₁', W - pad + 4, sy(0) + 4);
    ctx.fillText('x₂', sx(0) - 4, pad - 8);

    if (viewMode !== 'plu' && luTrail.length > 1) {
      for (let i = 1; i < luTrail.length; i++) {
        const alpha = i / luTrail.length * 0.4;
        ctx.strokeStyle = `rgba(239,68,68,${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx(luTrail[i - 1].x), sy(luTrail[i - 1].y));
        ctx.lineTo(sx(luTrail[i].x), sy(luTrail[i].y));
        ctx.stroke();
      }
    }

    function drawPoint(pt, color, label, glow) {
      const px = sx(pt.x1);
      const py = sy(pt.x2);
      const r = 8 + Math.sin(pulseT) * 2;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
      grad.addColorStop(0, glow);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px, py, r * 3, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '11px JetBrains Mono';
      ctx.fillText(label, px + 12, py - 8);
    }

    if (viewMode !== 'plu') {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx(truth.x1), sy(truth.x2));
      ctx.lineTo(sx(lu.x1), sy(lu.x2));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawPoint(truth, '#22C55E', `True (${fmt3(truth.x1)}, ${fmt3(truth.x2)})`, 'rgba(34,197,94,0.3)');
    if (viewMode !== 'plu') drawPoint(lu, '#EF4444', `LU (${fmt3(lu.x1)}, ${fmt3(lu.x2)})`, 'rgba(239,68,68,0.35)');
    if (viewMode !== 'lu') drawPoint(plu, '#3B82F6', `PLU (${fmt3(plu.x1)}, ${fmt3(plu.x2)})`, 'rgba(59,130,246,0.3)');

    ctx.fillStyle = 'rgba(17,24,39,0.85)';
    ctx.fillRect(pad, pad, 130, 36);
    ctx.strokeStyle = 'rgba(59,130,246,0.3)'; ctx.strokeRect(pad, pad, 130, 36);
    ctx.fillStyle = '#9CA3AF'; ctx.font = '9px JetBrains Mono';
    ctx.fillText(`ε = ${fmt3(epsilon)}`, pad + 8, pad + 14);
    ctx.fillText('precision: 3 sig figs', pad + 8, pad + 28);
  }

  function update() {
    epsilon = sliderToEps(Number(epsSlider.value));
    document.getElementById('eps-label').textContent = fmt3(epsilon);
    document.getElementById('disp-eps').textContent = fmt3(epsilon);

    const truth = trueSolution(epsilon);
    const lu = luNoPivot(epsilon);
    const plu = pluSolve(epsilon);

    if (lastEps !== epsilon) {
      luTrail.push({ x: lu.x1, y: lu.x2, eps: epsilon });
      if (luTrail.length > maxTrail) luTrail.shift();
      lastEps = epsilon;
    }

    document.getElementById('true-coords').textContent = `(${fmt3(truth.x1)}, ${fmt3(truth.x2)})`;
    document.getElementById('lu-coords').textContent = `(${fmt3(lu.x1)}, ${fmt3(lu.x2)})`;
    document.getElementById('plu-coords').textContent = `(${fmt3(plu.x1)}, ${fmt3(plu.x2)})`;
    document.getElementById('lu-error').textContent = `${relError(lu, truth).toFixed(1)}%`;
    document.getElementById('plu-error').textContent = `${relError(plu, truth).toFixed(2)}%`;

    renderTrace([lu, plu]);
    return { truth, lu, plu };
  }

  let lastState = update();

  function animate() {
    pulseT += 0.025;
    drawPivotPlot(lastState.truth, lastState.lu, lastState.plu);
    requestAnimationFrame(animate);
  }

  epsSlider.addEventListener('input', () => { lastState = update(); });
  ['view-both', 'view-lu', 'view-plu'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.querySelectorAll('#sim-pivot .mode-pill').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      viewMode = id.replace('view-', '');
    });
  });

  window.addEventListener('resize', () => { resize(); lastState = update(); });
  resize();
  animate();

  return { resize, update: () => { lastState = update(); } };
};
