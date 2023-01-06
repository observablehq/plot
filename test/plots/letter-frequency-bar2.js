import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    x: {
      percent: true,
      label: "Frequency (%) →"
    },
    y: {
      label: null
    },
    marks: [
      Plot.gridX({interval: 1}),
      Plot.axisX({anchor: "top"}),
      Plot.axisX({anchor: "bottom", label: null}),
      Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "steelblue"}),
      Plot.ruleX([0])
    ]
  });
}
