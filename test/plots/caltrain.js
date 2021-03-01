import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/caltrain.csv");
  return Plot.plot({
    x: {
      axis: null
    },
    y: {
      domain: d3.range(3, 26),
      axis: null
    },
    color: {
      domain: ["L", "B", "N"],
      range: ["rgb(183, 116, 9)", "rgb(196, 62, 29)", "rgb(34, 34, 34)"]
    },
    width: 240,
    marks: [
      Plot.text([[1, 3]], {text: ["Northbound"], textAnchor: "start"}),
      Plot.text([[-1, 3]], {text: ["Southbound"], textAnchor: "end"}),
      Plot.text(
        new Set(data.map(d => d.hours)),
        {
          x: () => 0,
          y: d => d,
          text: d => `${(d - 1) % 12 + 1}${(d % 24) >= 12 ? "p": "a"}`
        }
      ),
      Plot.text(
        data.filter(d => d.orientation === "N"),
        Plot.stackX2({
          x: () => 1,
          y: "hours",
          text: d => d.minutes.padStart(2, "0"),
          fill: "type",
          textAnchor: "start"
        })
      ),
      Plot.text(
        data.filter(d => d.orientation === "S"),
        Plot.stackX2({
          x: () => -1,
          y: "hours",
          text: d => d.minutes.padStart(2, "0"),
          fill: "type",
          textAnchor: "end"
        })
      ),
      Plot.ruleX([-0.5, 0.5])
    ]
  });
}
