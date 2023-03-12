import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usCongressAgeColorExplicit() {
  const data = await d3.csv<any>("data/us-congress-members.csv", d3.autoType);
  return Plot.plot({
    height: 300,
    x: {
      nice: true,
      label: "Age →",
      labelAnchor: "right"
    },
    y: {
      grid: true,
      label: "↑ Frequency"
    },
    marks: [
      Plot.dot(
        data,
        Plot.stackY2({
          x: (d) => 2021 - d.birth,
          stroke: "gender",
          fill: (d) => (d.gender === "F" ? "rgb(132, 165, 157)" : "#f6bd60"),
          title: "full_name"
        })
      ),
      Plot.ruleY([0])
    ]
  });
}
