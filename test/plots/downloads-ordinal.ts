import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function downloadsOrdinal() {
  const downloads = (await d3.csv<any>("data/downloads.csv", d3.autoType)).filter(
    (d) => d.date.getUTCFullYear() === 2019 && d.date.getUTCMonth() <= 1 && d.downloads > 0
  );
  return Plot.plot({
    width: 960,
    marginBottom: 55,
    x: {
      interval: "day",
      tickRotate: -90,
      tickFormat: "%b %d"
    },
    marks: [
      Plot.barY(downloads, {x: "date", y: "downloads", fill: "#ccc"}),
      Plot.tickY(downloads, {x: "date", y: "downloads"}),
      Plot.ruleY([0])
    ]
  });
}

export async function downloadsOrdinalIsostrings() {
  const downloads = (await d3.csv<any>("data/downloads.csv")).filter((d) => /20(19|20)-0/.test(d.date));
  return Plot.plot({
    width: 960,
    marginBottom: 50,
    x: {
      interval: "month",
      tickRotate: -45,
      tickFormat: "%b %Y",
      label: null
    },
    marks: [Plot.barY(downloads, {x: "date", y: "downloads", fill: "#ccc", stroke: "currentColor", title: "date"})]
  });
}
