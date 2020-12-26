import * as Plot from "@observablehq/plot";
import {max, median, min, quantile, rollups} from "d3-array";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const morley = await csv("data/morley.csv", autoType);
  const expts = rollups(morley, data => box(data, d => d.Speed), d => d.Expt);
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
  const q0 = min(values);
  const q1 = quantile(values, 0.25);
  const q2 = median(values);
  const q3 = quantile(values, 0.75);
  const q4 = max(values);
  const iqr = q3 - q1; // interquartile range
  const r0 = Math.max(q0, q1 - iqr * 1.5);
  const r1 = Math.min(q4, q3 + iqr * 1.5);
  return {
    min: q0,
    max: q4,
    median: q2,
    q1,
    q3,
    r0,
    r1,
    outliers: data.filter((v, i) => values[i] < r0 || values[i] > r1)
  };
}
