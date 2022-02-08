import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    color: {scheme: "cividis", type: "log", reverse: true},
    width: 820,
    height: 320,
    x: {inset: 20, ticks: 5},
    y: {inset: 10},
    grid: true,
    facet: {
      data: penguins,
      x: "sex",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.hexbin(penguins, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        radius: 12,
        fill: "brown",
        title: bin => `${bin.length} penguins.`
      }),
      Plot.dot(penguins, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        fill: "white",
        stroke: "black",
        strokeWidth: 0.5,
        r: 1.5
      })
    ]
  });
}
