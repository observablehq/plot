import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    facet: {
      data,
      x: "species"
    },
    fx: {
      domain: d3.groupSort(data, ({length}) => length, d => d.species).reverse()
    },
    x: {
      domain: ["MALE", "FEMALE", null],
      tickFormat: d => d === null ? "N/A" : d
    },
    y: {
      grid: true
    },
    color: {
      scheme: "greys"
    },
    marks: [
      Plot.barY(data, Plot.stackY(Plot.groupX({y: "count"}, {x: "sex", fill: "island", stroke: "black"}))),
      Plot.ruleY([0])
    ]
  });
}
