import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const n = 1000;
  const random = d3.randomLcg(42);
  const X = Float64Array.from({length: n}, random);
  const Y = Float64Array.from({length: n}, random);
  const VX = Float64Array.from({length: n}, () => (random() - 0.5 + Math.sign(random() - 0.5)) * 0.001);
  const VY = Float64Array.from({length: n}, () => (random() - 0.5 + Math.sign(random() - 0.5)) * 0.001);
  const plot = Plot.plot({
    inset: 1.5 + 1.5 + 1,
    x: {
      domain: [0, 1]
    },
    y: {
      domain: [0, 1]
    },
    marks: [
      Plot.frame(),
      Plot.dot({length: n}, {x: X, y: Y})
    ]
  });
  const x = plot.scale("x");
  const y = plot.scale("y");
  const circles = plot.querySelectorAll("circle");
  requestAnimationFrame(function tick() {
    if (!document.contains(plot)) return;
    requestAnimationFrame(tick);
    for (let i = 0; i < n; ++i) {
      X[i] += VX[i];
      Y[i] += VY[i];
      if (X[i] <= 0 || X[i] >= 1) VX[i] *= -1;
      if (Y[i] <= 0 || Y[i] >= 1) VY[i] *= -1;
    }
    for (let i = 0; i < n; ++i) {
      const circle = circles[i];
      circle.setAttribute("cx", x.apply(X[i]));
      circle.setAttribute("cy", y.apply(Y[i]));
    }
  });
  return plot;
}
