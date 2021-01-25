import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const morley = await d3.csv("data/morley.csv", d3.autoType);
  const expts = d3.rollup(morley, data => box(data, d => d.Speed), d => d.Expt);
  return Plot.plot({
    x: {
      grid: true,
      inset: 6
    },
    marks: [
      Plot.ruleY(expts, {
        x1: ([, box]) => box.r0,
        x2: ([, box]) => box.r1,
        y: ([expt]) => expt
      }),
      Plot.barX(expts, {
        x1: ([, box]) => box.q1,
        x2: ([, box]) => box.q3,
        y: ([expt]) => expt,
        fill: "#ccc"
      }),
      Plot.tickX(expts, {
        x: ([, box]) => box.median,
        y: ([expt]) => expt,
        strokeWidth: 2
      }),
      Plot.dot(expts, {
        transform: data => data.flatMap(([, box]) => box.outliers),
        x: "Speed",
        y: "Expt"
      })
    ]
  });
}

function box(data, accessor = x => x) {
  const values = Array.from(data, accessor);
  const min = d3.min(values);
  const max = d3.max(values);
  const median = d3.median(values);
  const q1 = d3.quantile(values, 0.25);
  const q3 = d3.quantile(values, 0.75);
  const iqr = q3 - q1; // interquartile range
  const r0 = Math.max(min, q1 - iqr * 1.5);
  const r1 = Math.min(max, q3 + iqr * 1.5);
  return {
    min,
    max,
    median,
    q1,
    q3,
    r0,
    r1,
    outliers: data.filter((v, i) => values[i] < r0 || values[i] > r1)
  };
}
