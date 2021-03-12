import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const morley = await d3.csv("data/morley.csv", d3.autoType);
  return Plot.plot({
    x: {
      grid: true,
      inset: 6
    },
    marks: [
      boxX(morley, {x: "Speed", y: "Expt"})
    ]
  });
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
  return [
    Plot.ruleY(data, Plot.reduceX({x1: iqr1, x2: iqr2}, {x, y, stroke, ...options})),
    Plot.barX(data, Plot.reduceX({x1: quartile1, x2: quartile3}, {x, y, fill, ...options})),
    Plot.tickX(data, Plot.reduceX({x: median}, {x, y, stroke, strokeWidth: 2, ...options})),
    Plot.dot(data, {x, y, stroke, ...options, transform: boxOutliers(x, y)})
  ];
}

// Returns a filter transform that returns outliers in x, optionally grouped by
// z. The minimum and maxmimum normal values (i.e., non-outliers) are defined by
// the specified arguments, and default to 1.5× the interquartile range.
function boxOutliers(x, z, min = iqr1, max = iqr2) {
  return (data, index) => {
    const X = Plot.valueof(data, x);
    const Z = Plot.valueof(data, z);
    return {
      data,
      index: index.map(I => {
        const F = [];
        for (const Iz of Z ? d3.group(I, i => Z[i]).values() : [I]) {
          const r1 = min(Iz, i => X[i]);
          const r2 = max(Iz, i => X[i]);
          for (const i of Iz) if (X[i] < r1 || X[i] > r2) F.push(i);
        }
        return F;
      })
    };
  };
}

function iqr1(values, value) {
  return Math.max(d3.min(values, value), quartile1(values, value) * 2.5 - quartile3(values, value) * 1.5);
}

function iqr2(values, value) {
  return Math.min(d3.max(values, value), quartile3(values, value) * 2.5 - quartile1(values, value) * 1.5);
}

function median(values, value) {
  return d3.median(values, value);
}

function quartile1(values, value) {
  return d3.quantile(values, 0.25, value);
}

function quartile3(values, value) {
  return d3.quantile(values, 0.75, value);
}
