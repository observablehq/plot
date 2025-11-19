import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function ridgeline() {
  const traffic = d3.sort(await d3.csv<any>("data/traffic.csv", d3.autoType), (d) => d.date);
  const overlap = 4.5;
  return Plot.plot({
    height: 40 + new Set(traffic.map((d) => d.location)).size * 17,
    width: 928,
    marginBottom: 1,
    marginLeft: 120,
    x: {axis: "top"},
    y: {axis: null, range: [2.5 * 17 - 2, (2.5 - overlap) * 17 - 2]},
    fy: {label: null, domain: traffic.map((d) => d.location)}, // preserve input order
    marks: [
      Plot.areaY(traffic, {
        x: "date",
        y: "vehicles",
        fy: "location",
        curve: "basis",
        sort: "date",
        fill: "color-mix(in oklab, var(--plot-background), currentColor 20%)",
        line: true
      })
    ]
  });
}
