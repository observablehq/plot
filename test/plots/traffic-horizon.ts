import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function trafficHorizon() {
  const data = d3.sort(await d3.csv<any>("data/traffic.csv", d3.autoType), (d) => d.date);
  const bands = 5; // just a hint; not guaranteed
  const max = d3.max(data, (d) => d.vehicles);
  const step = d3.tickStep(0, max, bands);
  const ticks = d3.ticks(0, max, bands);
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
      tickFormat: (
        (f) => (t) =>
          `≥${f(t)}`
      )(d3.format(",")),
      legend: true
    },
    fy: {
      axis: null,
      domain: data.map((d) => d.location) // respect input order
    },
    facet: {
      data,
      y: "location"
    },
    marks: [
      ticks.map((t) => Plot.areaY(data, {x: "date", y: (d) => d.vehicles - t, fill: t, clip: true})),
      Plot.text(data, Plot.selectFirst({text: "location", frameAnchor: "left"}))
    ]
  });
}
