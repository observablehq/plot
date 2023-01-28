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
      Plot.frame({stroke: "red", facet: "cross"}),
      Plot.text(["top"], {frameAnchor: "top", dy: 10, fill: "red", facet: "cross"}),
      Plot.text(["right"], {frameAnchor: "right", dx: -10, fill: "red", facet: "cross"}),
      Plot.text(["bottom"], {frameAnchor: "bottom", dy: -10, fill: "red", facet: "cross"}),
      Plot.text(["left"], {frameAnchor: "left", dx: 10, fill: "red", facet: "cross"}),
      Plot.text(["top-right"], {frameAnchor: "top-right", dy: 10, dx: -10, fill: "red", facet: "cross"}),
      Plot.text(["top-left"], {frameAnchor: "top-left", dy: 10, dx: 10, fill: "red", facet: "cross"}),
      Plot.text(["bottom-right"], {frameAnchor: "bottom-right", dy: -10, dx: -10, fill: "red", facet: "cross"}),
      Plot.text(["bottom-left"], {frameAnchor: "bottom-left", dy: -10, dx: 10, fill: "red", facet: "cross"}),
      Plot.arrow({length: 1}, {x1: ["FEMALE"], x2: ["MALE"], y1: ["Adelie"], y2: ["Chinstrap"], stroke: "red", facet: "cross", bend: true})
    ]
  });
}
