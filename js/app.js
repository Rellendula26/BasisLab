/**
 * spanlab/app.js
 * Bootstraps tab navigation and both simulations.
 */
window.SpanLab = window.SpanLab || {};

(function initSpanLab() {
  const tabs = {
    pivot: document.getElementById('sim-pivot'),
    subspace: document.getElementById('sim-subspace')
  };

  let pivotSim;
  let subspaceSim;

  function switchTab(name) {
    Object.entries(tabs).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
    document.getElementById('tab-pivot').classList.toggle('active', name === 'pivot');
    document.getElementById('tab-subspace').classList.toggle('active', name === 'subspace');
    if (name === 'subspace' && subspaceSim) {
      requestAnimationFrame(() => subspaceSim.resize());
    }
  }

  document.getElementById('tab-pivot').addEventListener('click', () => switchTab('pivot'));
  document.getElementById('tab-subspace').addEventListener('click', () => switchTab('subspace'));

  pivotSim = SpanLab.createPivotSim();
  subspaceSim = SpanLab.createSubspaceSim();

  SpanLab.app = { pivotSim, subspaceSim, switchTab };
})();
