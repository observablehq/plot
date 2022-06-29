import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const caltrain = await d3.csv("data/caltrain.csv");
  return Plot.plot({
    width: 240,
    axis: null,
    y: {
      domain: d3.range(3, 26).map(String)
    },
    color: {
      domain: "NLB",
      range: ["currentColor", "peru", "brown"],
      legend: true
    },
    marks: [
      Plot.text([[1, "3"]], {
        text: ["Northbound"],
        textAnchor: "start"
      }),
      Plot.text([[-1, "3"]], {
        text: ["Southbound"],
        textAnchor: "end"
      }),
      Plot.text(new Set(caltrain.map((d) => d.hours)), {
        x: 0,
        y: (d) => d,
        text: (d) => `${((d - 1) % 12) + 1}${d % 24 >= 12 ? "p" : "a"}`
      }),
      Plot.text(
        caltrain,
        Plot.stackX2({
          filter: (d) => d.orientation === "N",
          x: 1,
          y: "hours",
          text: (d) => d.minutes.padStart(2, "0"),
          fill: "type",
          textAnchor: "start"
        })
      ),
      Plot.text(
        caltrain,
        Plot.stackX2({
          filter: (d) => d.orientation === "S",
          x: -1,
          y: "hours",
          text: (d) => d.minutes.padStart(2, "0"),
          fill: "type",
          textAnchor: "end"
        })
      ),
      Plot.ruleX([-0.5, 0.5])
    ]
  });
}
