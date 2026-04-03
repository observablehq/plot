import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function downloads() {
  const downloads = (await d3.csv<any>("data/downloads.csv", d3.autoType)).filter((d) => d.downloads > 0);
  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.areaY(downloads, {x: "date", interval: "day", y: "downloads", curve: "step", fill: "#ccc", line: true, strokeWidth: 1})
    ]
  });
});
