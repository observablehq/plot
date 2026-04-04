import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function musicRevenue() {
  const riaa = await d3.csv<any>("data/riaa-us-revenue.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "Annual revenue (billions, adj.)",
      transform: (d) => d / 1000
    },
    marks: [
      Plot.areaY(riaa, {
        x: "year",
        y: "revenue",
        z: "format",
        order: "-appearance",
        fill: "group",
        title: (d: any) => `${d.format}\n${d.group}`,
        line: true,
        fillOpacity: 1,
        stroke: "white",
        strokeWidth: 1
      }),
      Plot.ruleY([0])
    ]
  });
});

test(async function musicRevenueCustomOrder() {
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
});
