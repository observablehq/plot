import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 600,
    grid: true,
    facet: {
      data: penguins,
      x: "sex",
      y: "species",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(penguins, {facet: "exclude", x: "culmen_depth_mm", y: "culmen_length_mm", r: 2, fill: "#ddd"}),
      Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"}),
      Plot.frame({facet: "super", stroke: "red"}),
      Plot.text(["top"], {facet: "super", frameAnchor: "top", dy: 10, fill: "red"}),
      Plot.text(["right"], {facet: "super", frameAnchor: "right", dx: -10, fill: "red"}),
      Plot.text(["bottom"], {facet: "super", frameAnchor: "bottom", dy: -10, fill: "red"}),
      Plot.text(["left"], {facet: "super", frameAnchor: "left", dx: 10, fill: "red"}),
      Plot.text(["top-right"], {facet: "super", frameAnchor: "top-right", dy: 10, dx: -10, fill: "red"}),
      Plot.text(["top-left"], {facet: "super", frameAnchor: "top-left", dy: 10, dx: 10, fill: "red"}),
      Plot.text(["bottom-right"], {facet: "super", frameAnchor: "bottom-right", dy: -10, dx: -10, fill: "red"}),
      Plot.text(["bottom-left"], {facet: "super", frameAnchor: "bottom-left", dy: -10, dx: 10, fill: "red"})
    ]
  });
}
