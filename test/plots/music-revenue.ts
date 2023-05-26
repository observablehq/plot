import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function musicRevenue() {
  const riaa = await d3.csv<any>("data/riaa-us-revenue.csv", d3.autoType);
  const stack: Plot.AreaYOptions = {
    x: "year",
    y: "revenue",
    z: "format",
    order: "-appearance"
  };
  return Plot.plot({
    y: {
      grid: true,
      label: "Annual revenue (billions, adj.)",
      transform: (d) => d / 1000
    },
    marks: [
      Plot.areaY(riaa, Plot.stackY({...stack, fill: "group", title: (d) => `${d.format}\n${d.group}`})),
      Plot.lineY(riaa, Plot.stackY2({...stack, stroke: "white", strokeWidth: 1})),
      Plot.ruleY([0])
    ]
  });
}

export async function musicRevenueCustomOrder() {
  const riaa = await d3.csv<any>("data/riaa-us-revenue.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "Annual revenue (billions, adj.)",
      transform: (d) => d / 1000
    },
    marks: [
      Plot.areaY(
        riaa,
        Plot.stackY({
          x: "year",
          y: "revenue",
          z: "format",
          order: (a, b) => d3.ascending(a.group, b.group) || d3.descending(a.revenue, b.revenue),
          fill: "group",
          stroke: "white",
          title: (d) => `${d.format}\n${d.group}`
        })
      ),
      Plot.ruleY([0])
    ]
  });
}
