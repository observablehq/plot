import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function musicRevenue() {
  const data = await d3.csv<any>("data/riaa-us-revenue.csv", d3.autoType);
  const stack: Plot.AreaYOptions = {
    x: "year",
    y: "revenue",
    z: "format",
    order: "appearance",
    reverse: true
  };
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Annual revenue (billions, adj.)",
      transform: (d) => d / 1000
    },
    marks: [
      Plot.areaY(data, Plot.stackY({...stack, fill: "group", title: (d) => `${d.format}\n${d.group}`})),
      Plot.lineY(data, Plot.stackY2({...stack, stroke: "white", strokeWidth: 1})),
      Plot.ruleY([0])
    ]
  });
}
