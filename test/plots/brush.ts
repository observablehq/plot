import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function brushBand() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.cell(penguins, Plot.group({fill: "count"}, {x: "species", y: "sex", fillOpacity: 0.3})),
      Plot.cell(penguins, Plot.brush(Plot.group({fill: "count"}, {x: "species", y: "sex"})))
    ]
  });
}

export async function brushFacets() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    facet: {data: penguins, x: "species"},
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}),
      Plot.dot(penguins, Plot.brush({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", stroke: "black"}))
    ]
  });
}

export async function brushRectX() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectX(penguins, Plot.binY({x: "count"}, {y: "body_mass_g", fillOpacity: 0.5, thresholds: 20})),
      Plot.rectX(penguins, Plot.brushY(Plot.binY({x: "count"}, {y: "body_mass_g", thresholds: 20})))
    ]
  });
}

export async function brushRectY() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectY(penguins, Plot.binX({y: "count"}, {x: "body_mass_g", fillOpacity: 0.5, thresholds: 20})),
      Plot.rectY(penguins, Plot.brushX(Plot.binX({y: "count"}, {x: "body_mass_g", thresholds: 20})))
    ]
  });
}

export async function brushScatterplot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}),
      Plot.dot(penguins, Plot.brush({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", stroke: "black"}))
    ]
  });
}
