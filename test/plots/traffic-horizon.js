import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = d3.sort(await d3.csv("data/traffic.csv", d3.autoType), d => d.date);
  const bands = 7;
  const step = +(d3.max(data, d => d.value) / bands).toPrecision(2);
  return Plot.plot({
    width: 960,
    height: 1100,
    x: {
      axis: "top"
    },
    y: {
      axis: null,
      domain: [0, step]
    },
    color: {
      type: "ordinal",
      scheme: "blues",
      tickFormat: (f => i => `<${f((i + 1) * step)}`)(d3.format(",")),
      legend: true
    },
    fy: {
      axis: null,
      domain: data.map((d) => d.name) // respect input order
    },
    facet: {
      data,
      y: "name"
    },
    marks: [
      d3.range(bands).map(i => Plot.areaY(data, {x: "date", y: d => d.value - i * step, fill: () => i, clip: true})),
      Plot.text(data, Plot.selectFirst({text: "name", frameAnchor: "left"}))
    ]
  });
}
