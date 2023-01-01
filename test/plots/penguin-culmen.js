import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 600,
    // axis: null,
    // margin: 30,
    // marginLeft: 40,
    // marginRight: 80,
    facet: {
      data: penguins,
      x: "sex",
      y: "species",
      // margin: 0,
      marginRight: 80
    },
    marks: [
      // Plot.axisX({grid: true}),
      // Plot.axisY({grid: true}),
      // Plot.axisFx(),
      // Plot.axisFy(),
      Plot.frame(),
      Plot.dot(penguins, {facet: "exclude", x: "culmen_depth_mm", y: "culmen_length_mm", r: 2, fill: "#ddd"}),
      Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
    ]
  });
}
