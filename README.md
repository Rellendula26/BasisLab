# BasisLab

A small linear-algebra teaching site for ESE 2030. The interface calls itself "spanlab" and provides two interactive demonstrations:

- **Bad Pivot**: compares elimination with and without pivoting in a small linear system, using three-digit finite precision to show numerical instability.
- **Subspaces**: contrasts the union of two subspaces with their sum and shows why closure matters.

## Run

With Python 3 installed, run from the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, switch between the two tabs, and adjust the controls. No npm installation or backend is needed.

## Code map

- `index.html`: interface and controls.
- `js/math.js`: numerical helpers.
- `js/pivot-sim.js`: finite-precision elimination demonstration.
- `js/subspace-sim.js`: union/sum demonstration.
- `js/canvas-draw.js`: drawing helpers.
- `js/app.js`: interface wiring.
- `css/styles.css`: local styling.

## Limits

This is a focused educational demo, not a general linear-algebra solver. Tailwind and Font Awesome load from CDNs, so styling depends on network access. There is no automated test suite in this checkout.
