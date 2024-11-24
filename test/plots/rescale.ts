import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function rescaleZoom() {
  const data = await d3.csv<any>("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(data, {x: "Date", y: "Anomaly", stroke: "Anomaly"}).plot();
  requestAnimationFrame(() => {
    let frame: number;
    (function tick(now) {
      if (!plot.isConnected) return cancelAnimationFrame(frame);
      const t = (Math.sin(now / 2000) + 1) / 2;
      const [x1, x2] = plot.scale("x").domain;
      plot.rescale({x: {domain: [+x1 + ((x2 - x1) / 2) * t, +x1 + ((x2 - x1) / 2) * (t + 1)]}});
      frame = requestAnimationFrame(tick);
    })(performance.now());
  });
  return plot;
}
