import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/software-versions.csv");
  const options = Plot.stackX(
    Plot.groupZ(
      {
        x: "proportion", // uses sumOrCount in the patched version
        text: "first"
      },
      {
        x: "key", // this is only strings
        fill: "key",
        text: "key",
        insetRight: 1,
        order: "value"
      }
    )
  );
  return Plot.plot({
    marks: [
      Plot.ruleX([0]),
      Plot.barX(data, options),
      Plot.textX(data, { ...options, fill: "#000" })
    ],
    x: {
      percent: true
    }
  });
}
