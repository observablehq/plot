import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const p1 = d3.greatest(penguins, (p) => p.species === "Adelie" && p.sex === "FEMALE" ? p.culmen_length_mm : NaN);
  const p2 = d3.greatest(penguins, (p) => p.species === "Adelie" && p.sex === "MALE" ? p.culmen_length_mm : NaN);
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
      Plot.frame({super: true, stroke: "red"}),
      Plot.text(["top"], {super: true, frameAnchor: "top", dy: 10, fill: "red"}),
      Plot.text(["right"], {super: true, frameAnchor: "right", dx: -10, fill: "red"}),
      Plot.text(["bottom"], {super: true, frameAnchor: "bottom", dy: -10, fill: "red"}),
      Plot.text(["left"], {super: true, frameAnchor: "left", dx: 10, fill: "red"}),
      Plot.text(["top-right"], {super: true, frameAnchor: "top-right", dy: 10, dx: -10, fill: "red"}),
      Plot.text(["top-left"], {super: true, frameAnchor: "top-left", dy: 10, dx: 10, fill: "red"}),
      Plot.text(["bottom-right"], {super: true, frameAnchor: "bottom-right", dy: -10, dx: -10, fill: "red"}),
      Plot.text(["bottom-left"], {super: true, frameAnchor: "bottom-left", dy: -10, dx: 10, fill: "red"}),
      Plot.arrow({length: 1}, {super: true, x1: [p1.culmen_depth_mm], x2: [p2.culmen_depth_mm], y1: [p1.culmen_length_mm], y2: [p2.culmen_length_mm], fx1: [p1.sex], fx2: [p2.sex], fy1: [p1.species], fy2: [p2.species], stroke: "red", bend: true})
    ]
  });
}
