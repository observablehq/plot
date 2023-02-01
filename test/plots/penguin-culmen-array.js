import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  const culmen_depth_mm = data.map((d) => d.culmen_depth_mm);
  const culmen_length_mm = data.map((d) => d.culmen_length_mm);
  return Plot.plot({
    height: 600,
    grid: true,
    facet: {
      data,
      x: "sex",
      y: "species",
      marginRight: 80
    },
    marks: [
      Plot.dot(data, {facet: null, x: culmen_depth_mm, y: culmen_length_mm, r: 2, fill: "#ddd"}),
      Plot.dot(data, {x: culmen_depth_mm, y: culmen_length_mm})
    ]
  });
}
