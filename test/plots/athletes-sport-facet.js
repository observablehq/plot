import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 700,
    grid: true,
    x: {
      ticks: 8
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
      marginLeft: 100,
      x: "sport",
      y: "sport",
      rows: 4
    },
    fx: { axis: null },
    fy: { axis: null },
    marks: [
      Plot.frame(),
      Plot.dot(athletes, {x: "weight", y: "height", r: 1, fill: "sex"}),
      Plot.text(athletes, Plot.groupZ({text: "count"}, {z: "sport", x: () => 100, y: () => 1.3})),
      Plot.text(athletes, Plot.selectFirst({text: "sport", x: () => 100, y: () => 2.1}))
    ]
  });
}
