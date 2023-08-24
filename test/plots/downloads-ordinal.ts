import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function downloadsOrdinal() {
  const downloads = (await d3.csv<any>("data/downloads.csv", d3.autoType)).filter(
    (d) => d.date.getUTCFullYear() === 2019 && d.date.getUTCMonth() <= 1 && d.downloads > 0
  );
  return Plot.plot({
    x: {interval: "day"},
    marks: [
      Plot.barY(downloads, {x: "date", y: "downloads", fill: "#ccc"}),
      Plot.tickY(downloads, {x: "date", y: "downloads"}),
      Plot.ruleY([0])
    ]
  });
}
