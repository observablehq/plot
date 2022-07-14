import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const n = 1000;
  const random = d3.randomLcg(42);
  const data = {length: n};
  const X = Float64Array.from(data, random);
  const Y = Float64Array.from(data, random);
  const VX = Float64Array.from(data, () => (random() - 0.5 + Math.sign(random() - 0.5)) * 0.01);
  const VY = Float64Array.from(data, () => (random() - 0.5 + Math.sign(random() - 0.5)) * 0.01);
  const dot = Plot.dot(data, {x: X, y: Y});
  const plot = Plot.plot({
    inset: 1.5 + 1.5 + 1,
    x: {
      domain: [0, 1]
    },
    y: {
      domain: [0, 1]
    },
    marks: [Plot.frame(), dot]
  });
  requestAnimationFrame(function tick() {
    if (!document.contains(plot)) return;
    for (let i = 0; i < n; ++i) {
      X[i] += VX[i];
      Y[i] += VY[i];
      if (X[i] <= 0 || X[i] >= 1) VX[i] *= -1;
      if (Y[i] <= 0 || Y[i] >= 1) VY[i] *= -1;
    }
    plot
      .replot({mark: dot, x: X, y: Y, animation: 250})
      .then(tick);
  });
  return plot;
}
