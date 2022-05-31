import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 700,
    grid: true,
    x: {
      ticks: 3
    },
    y: {
      ticks: 5
    },
    color: {
      scheme: "YlGnBu",
      zero: true
    },
    facet: {
      data: athletes,
      y: "sport",
      columns: 5
    },
    marks: [
      Plot.frame(),
      Plot.dot(athletes, { x: "weight", y: "height", r: 1, fill: "sex", title: "sport", sort: {fy: "y", reduce: "mean"} }),
      Plot.text(athletes, Plot.groupZ({ text: "count"}, { frameAnchor: "bottom", dy: -4 })),
      Plot.text(athletes, Plot.selectFirst({ text: "sport", frameAnchor: "top", dy: 4 }))
    ]
  });
}
