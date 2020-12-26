import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const temperatures = await d3.csv("data/sf-temperatures.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: null // TODO Default to null for temporal scales?
    },
    y: {
      grid: true,
      label: "↑ Daily temperature range (°F)"
    },
    marks: [
      Plot.areaY(temperatures, {x: "date", y1: "low", y2: "high", curve: "step", fill: "#ccc"}),
      Plot.line(temperatures, {x: "date", y: movingAverage(temperatures, 7, d => d.low), curve: "step", stroke: "blue"}),
      Plot.line(temperatures, {x: "date", y: movingAverage(temperatures, 7, d => d.high), curve: "step", stroke: "red"})
    ],
    width: 960
  });
}

// TODO Move to d3-array?
function movingAverage(values, N, value) {
  let i = 0;
  let sum = 0;
  values = Float64Array.from(values, value);
  const means = new Float64Array(values.length);
  for (let n = Math.min(N - 1, values.length); i < n; ++i) {
    means[i] = NaN;
    sum += values[i];
  }
  for (let n = values.length; i < n; ++i) {
    sum += values[i];
    means[i] = sum / N;
    sum -= values[i - N + 1];
  }
  means.subarray(0, N >> 1).reverse();
  means.subarray(N >> 1).reverse();
  means.reverse();
  return means;
}
