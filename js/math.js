/**
 * spanlab/math.js
 * Finite-precision helpers for the Bad Pivot simulation.
 */
window.SpanLab = window.SpanLab || {};

SpanLab.math = {
  /** Round to 3 significant figures */
  round3(x) {
    if (x === 0 || !isFinite(x)) return x;
    const sign = Math.sign(x);
    x = Math.abs(x);
    const exp = Math.floor(Math.log10(x));
    const factor = Math.pow(10, 2 - exp);
    return sign * Math.round(x * factor) / factor;
  },

  fmt3(x) {
    if (!isFinite(x)) return 'NaN';
    if (Math.abs(x) >= 1000 || (Math.abs(x) < 0.001 && x !== 0)) return x.toExponential(2);
    return SpanLab.math.round3(x).toString();
  },

  fmt2(x) {
    return Number(x).toFixed(2);
  },

  /** Map slider [0,1000] → ε ∈ [0.1, 0.0001] logarithmically */
  sliderToEps(v) {
    const logMin = Math.log10(0.0001);
    const logMax = Math.log10(0.1);
    const t = v / 1000;
    return Math.pow(10, logMax + t * (logMin - logMax));
  },

  /** Analytical solution for the 2×2 pivot demo system */
  trueSolution(eps) {
    const { round3 } = SpanLab.math;
    return {
      x1: round3(1 / (1 - eps)),
      x2: round3((1 - 2 * eps) / (1 - eps))
    };
  },

  relError(computed, truth) {
    const err1 = Math.abs((computed.x1 - truth.x1) / (truth.x1 || 1));
    const err2 = Math.abs((computed.x2 - truth.x2) / (truth.x2 || 1));
    return Math.max(err1, err2) * 100;
  }
};
