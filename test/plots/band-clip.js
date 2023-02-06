import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  return Plot.plot({
    y: {type: "band"},
    marks: [
      Plot.frame(),
      Plot.text(["A", "B", "C"], {
        x: (d) => d,
        y: (d) => d,
        clip: true,
        fontSize: 50
      })
    ]
  });
}

export async function bandClip2() {
  const data = [
    {Date: new Date("2022-12-01"), Count: 10},
    {Date: new Date("2022-12-02"), Count: 1},
    {Date: new Date("2022-12-02"), Count: 1},
    {Date: new Date("2022-12-03"), Count: 2},
    {Date: new Date("2022-12-04"), Count: 3},
    {Date: new Date("2022-12-05"), Count: 4},
    {Date: new Date("2022-12-06"), Count: 5}
  ];
  return Plot.plot({
    grid: true,
    x: {interval: d3.utcDay},
    marks: [
      Plot.ruleY([0]),
      Plot.barY(data, Plot.groupX({y: "sum"}, {x: "Date", y: "Count", rx: 6, insetBottom: -6, clip: "frame"}))
    ]
  });
}
