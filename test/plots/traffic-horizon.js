import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = d3.sort(await d3.csv("data/traffic.csv", d3.autoType), d => d.date);
  const bands = 7;
  const step = +(d3.max(data, d => d.value) / bands).toPrecision(2);
  const format = d3.format(",");
  const ticks = d3.range(bands).map(d => ({
    low: d * step,
    label: `< ${format((d + 1) * step)}`
  }));
  return Plot.plot({
    x: {axis: "top"},
    y: {axis: null, domain: [0, step]},
    color: {
      scheme: "blues",
      range: [1 / (bands + 1), 1 - 1 / (bands + 1)],
      legend: true
    },
    fy: { axis: null, domain: new Set(data.map((d) => d.name)) },
    facet: { data, y: "name" },
    marks: [
      ticks.map(({low, label}) => Plot.areaY(data, {
        x: "date",
        y: d => d.value - low,
        fill: () => label,
        clip: true
      })),
      Plot.text(data, Plot.selectFirst({text: "name", frameAnchor: "left"}))
    ],
    height: 1100,
    width: 960
  });
}
