import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function boxplot() {
  return Plot.boxX([0, 3, 4.4, 4.5, 4.6, 5, 7]).plot();
}

export async function boxplotFacetInterval() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    fy: {
      grid: true,
      tickFormat: String, // for debugging
      interval: 0.1,
      reverse: true
    },
    marks: [
      Plot.boxX(
        olympians.filter((d) => d.height),
        {x: "weight", fy: "height", tip: true}
      )
    ]
  });
}

export async function boxplotFacetNegativeInterval() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    fy: {
      grid: true,
      tickFormat: String, // for debugging
      interval: -10, // 0.1
      reverse: true
    },
    marks: [
      Plot.boxX(
        olympians.filter((d) => d.height),
        {x: "weight", fy: "height"}
      )
    ]
  });
}

export async function boxplotY() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    fx: {
      grid: true,
      tickFormat: String, // for debugging
      interval: 5,
      reverse: true
    },
    marks: [
      Plot.boxY(
        olympians.filter((d) => d.height),
        {fx: "weight", y: "height", tip: true}
      )
    ]
  });
}

export async function boxplotCounts() {
  const numbers = Array.from({length: 64}, (_, i) => {
    const x = i % 16;
    const y = Math.floor(i / 16);
    return {x: x > 15 - y ? NaN : 1 + x, y};
  });
  return Plot.boxX(numbers, {
    x: "x",
    y: "y",
    tip: true
  }).plot({
    style: "overflow: visible;"
  });
}
