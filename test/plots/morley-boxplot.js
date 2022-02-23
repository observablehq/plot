import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const morley = await d3.csv("data/morley.csv", d3.autoType);
  return boxX(morley, {x: "Speed", y: "Expt"}).plot({x: {grid: true, inset: 6}});
}

// Returns a composite mark for producing a box plot, applying the necessary
// statistical transforms. The boxes are grouped by y, if present.
function boxX(data, {
  x = x => x,
  y = null,
  fill = "#ccc",
  stroke = "currentColor",
  ...options
} = {}) {
  return Plot.marks(
    Plot.ruleY(data, Plot.groupY({x1: iqr1, x2: iqr2}, {x, y, stroke, ...options})),
    Plot.barX(data, Plot.groupY({x1: "p25", x2: "p75"}, {x, y, fill, ...options})),
    Plot.tickX(data, Plot.groupY({x: "p50"}, {x, y, stroke, strokeWidth: 2, ...options})),
    Plot.dot(data, Plot.map({x: outliers}, {x, y, z: y, stroke, ...options}))
  );
}

// A map function that returns only outliers, returning NaN for non-outliers
// (values within 1.5× of the interquartile range).
function outliers(values) {
  const r1 = iqr1(values);
  const r2 = iqr2(values);
  return values.map(v => v < r1 || v > r2 ? v : NaN);
}

function iqr1(values, value) {
  return Math.max(d3.min(values, value), quartile1(values, value) * 2.5 - quartile3(values, value) * 1.5);
}

function iqr2(values, value) {
  return Math.min(d3.max(values, value), quartile3(values, value) * 2.5 - quartile1(values, value) * 1.5);
}

function quartile1(values, value) {
  return d3.quantile(values, 0.25, value);
}

function quartile3(values, value) {
  return d3.quantile(values, 0.75, value);
}
