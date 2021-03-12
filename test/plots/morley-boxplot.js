import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const morley = await d3.csv("data/morley.csv", d3.autoType);
  const expts = d3.rollups(morley, data => box(data, d => d.Speed), d => d.Expt);
  return Plot.plot({
    x: {
      grid: true,
      inset: 6
    },
    marks: [
      Plot.ruleY(expts, {x1: ([, b]) => b.r1, x2: ([, b]) => b.r2, y: ([expt]) => expt}),
      Plot.barX(expts, {x1: ([, b]) => b.q1, x2: ([, b]) => b.q3, y: ([expt]) => expt, fill: "#ccc"}),
      Plot.tickX(expts, {x: ([, b]) => b.q2, y: ([expt]) => expt, strokeWidth: 2}),
      Plot.dot(expts.flatMap(([, b]) => b.outliers), {x: "Speed", y: "Expt"})
    ]
  });
}

function box(data, accessor = x => x) {
  const values = Float64Array.from(data, accessor);
  const q2 = d3.median(values);
  const q1 = d3.quantile(values, 0.25); // first quartile
  const q3 = d3.quantile(values, 0.75); // second quartile
  const iqr = q3 - q1; // interquartile range
  const r1 = Math.max(d3.min(values), q1 - iqr * 1.5);
  const r2 = Math.min(d3.max(values), q3 + iqr * 1.5);
  return {
    q1,
    q2,
    q3,
    r1,
    r2,
    outliers: data.filter((v, i) => values[i] < r1 || values[i] > r2)
  };
}
