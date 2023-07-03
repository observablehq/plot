import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function flareTreemap() {
  const flare = await d3.csv("data/flare.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.treemap(flare, {
        path: "name",
        delimiter: ".",
        value: "size",
        text: null,
        fill: "node:branch"
      })
    ]
  });
}

export async function flareTreemapFacet() {
  const flare = await d3.csv("data/flare.csv", d3.autoType);
  return Plot.plot({
    fx: {axis: "bottom"},
    axis: null,
    marks: [
      Plot.treemap(flare, {
        fx: (d) => (d.name.split(".")[1] === "vis" ? "vis" : "not vis"),
        path: "name",
        delimiter: ".",
        value: "size",
        fill: (d) => d.name.split(".")[1]
      }),
      Plot.frame()
    ]
  });
}

export async function flareTreemapText() {
  const flare = await d3.csv("data/flare.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.treemap(flare, {
        path: "name",
        delimiter: ".",
        value: "size",
        tip: true,
        fill: (d) => d.name.split(".")[1]
      })
    ]
  });
}
