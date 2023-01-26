import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    facet: {data, y: "industry"},
    marginLeft: 140,
    marks: [
      Plot.barX(data, {
        x: "date",
        interval: "month",
        fill: "unemployed",
        title: "unemployed",
        sort: {fy: "fill", reverse: true},
        inset: 0
      }),
      Plot.dotX(
        data,
        Plot.select(
          {
            title: "max"
          },
          {
            x: "date",
            interval: "month",
            stroke: "#fff",
            fill: "black",
            strokeWidth: 1.5,
            title: "unemployed",
            z: "industry"
          }
        )
      ),
      Plot.dotX(
        data,
        Plot.select(
          {
            value: "min"
          },
          {
            x: "date",
            interval: "month",
            value: "unemployed",
            fill: "#333",
            title: "unemployed",
            z: "industry"
          }
        )
      )
    ],
    color: {scheme: "plasma", reverse: true}
  });
}
