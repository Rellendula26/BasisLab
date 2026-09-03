/**
 * spanlab/canvas-draw.js
 * Shared 2D canvas drawing primitives for vector simulations.
 */
window.SpanLab = window.SpanLab || {};

SpanLab.canvasDraw = {
  /** Build world ↔ screen transforms centered on canvas */
  makeTransform(canvas, worldSpan = 10) {
    const W = canvas.width;
    const H = canvas.height;
    const scale = Math.min(W, H) / worldSpan;
    const cx = W / 2;
    const cy = H / 2;

    return {
      toScreen(x, y) {
        return { px: cx + x * scale, py: cy - y * scale, scale };
      },
      toWorld(px, py) {
        return { x: (px - cx) / scale, y: -(py - cy) / scale };
      }
    };
  },

  drawGrid(ctx, canvas, toScreen, lines = 5) {
    const W = canvas.width;
    const H = canvas.height;
    ctx.strokeStyle = 'rgba(59,130,246,0.07)';
    ctx.lineWidth = 1;
    for (let i = -lines; i <= lines; i++) {
      const vx = toScreen(i, 0);
      ctx.beginPath(); ctx.moveTo(vx.px, 0); ctx.lineTo(vx.px, H); ctx.stroke();
      const hy = toScreen(0, i);
      ctx.beginPath(); ctx.moveTo(0, hy.py); ctx.lineTo(W, hy.py); ctx.stroke();
    }
  },

  drawInfiniteLine(ctx, canvas, toScreen, dir, color, label) {
    const len = Math.hypot(dir.x, dir.y) || 1;
    const dx = dir.x / len;
    const dy = dir.y / len;
    const big = Math.max(canvas.width, canvas.height) * 2;
    const p1 = toScreen(dx * big, dy * big);
    const p2 = toScreen(-dx * big, -dy * big);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(p1.px, p1.py);
    ctx.lineTo(p2.px, p2.py);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (label) {
      const lp = toScreen(dx * 3.5, dy * 3.5);
      ctx.fillStyle = color;
      ctx.font = '600 12px Inter';
      ctx.fillText(label, lp.px + 6, lp.py - 6);
    }
    ctx.restore();
  },

  drawVector(ctx, toScreen, from, to, color, opts = {}) {
    const f = toScreen(from.x, from.y);
    const t = toScreen(to.x, to.y);
    const { dashed = false, width = 3, arrow = true, glow = true } = opts;

    ctx.save();
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 10; }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dashed ? [8, 6] : []);
    ctx.beginPath();
    ctx.moveTo(f.px, f.py);
    ctx.lineTo(t.px, t.py);
    ctx.stroke();

    if (arrow) {
      const angle = Math.atan2(t.py - f.py, t.px - f.px);
      const headLen = 12;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(t.px, t.py);
      ctx.lineTo(t.px - headLen * Math.cos(angle - 0.35), t.py - headLen * Math.sin(angle - 0.35));
      ctx.lineTo(t.px - headLen * Math.cos(angle + 0.35), t.py - headLen * Math.sin(angle + 0.35));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },

  drawHandle(ctx, toScreen, vec, color, id, dragging, animT) {
    const p = toScreen(vec.x, vec.y);
    const pulse = 1 + Math.sin(animT * 3 + (typeof id === 'number' ? id : id.charCodeAt(0))) * 0.08;
    const r = (dragging === id ? 14 : 10) * pulse;

    ctx.beginPath();
    ctx.arc(p.px, p.py, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = color + '66';
    ctx.lineWidth = 2;
    ctx.stroke();

    const grad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, color + 'aa');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
    ctx.fill();
  }
};
