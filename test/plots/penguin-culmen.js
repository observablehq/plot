import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 80,
    height: 600,
    facet: {
      data,
      x: "sex",
      y: "species"
    },
    marks: [
      Plot.dot(data.slice(), {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        r: 2,
        fill: "#ddd"
      }),
      Plot.dot(data, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm"
      })
    ]
  });
}
