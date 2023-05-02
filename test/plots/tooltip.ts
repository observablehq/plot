import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function tooltipDotColor() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
      Plot.tooltip(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"})
    ]
  });
}

export async function tooltipDotFacets() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    fy: {
      label: "decade of birth",
      interval: "10 years"
    },
    marks: [
      Plot.dot(athletes, {x: "weight", y: "height", fx: "sex", fy: "date_of_birth"}),
      Plot.tooltip(athletes, {x: "weight", y: "height", fx: "sex", fy: "date_of_birth"})
    ]
  });
}
