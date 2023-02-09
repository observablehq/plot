import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 600,
    facet: {marginRight: 80},
    marks: [
      Plot.frame(),
      Plot.dot(data, {
        fx: "sex",
        fy: "species",
        facet: "exclude",
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        r: 2,
        fill: "#ddd"
      }),
      Plot.dot(data, {
        fx: "sex",
        fy: "species",
        x: "culmen_depth_mm",
        y: "culmen_length_mm"
      })
    ]
  });
}
