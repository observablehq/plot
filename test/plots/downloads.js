import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const downloads = (await d3.csv("data/downloads.csv", d3.autoType)).filter((d) => d.downloads > 0);
  return Plot.plot({
    marks: [
      Plot.areaY(downloads, {x: "date", interval: d3.utcDay, y: "downloads", curve: "step", fill: "#ccc"}),
      Plot.ruleY([0]),
      Plot.lineY(downloads, {x: "date", interval: d3.utcDay, y: "downloads", curve: "step", strokeWidth: 1})
    ]
  });
}
