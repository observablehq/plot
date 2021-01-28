import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    y: {
      axis: null
    },
    marks: [
      Plot.stackAreaY(data, {
        x: "date",
        y: "unemployed",
        fill: "industry",
        title: "industry",
        offset: "silhouette",
        curve: "basis",
        z: "industry",
        zOrder: d3.groupSort(data, v => d3.median(v, d => d.unemployed), d => d.industry)
      })
    ]
  });
}
