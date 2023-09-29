import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function crosshairDodge() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 160,
    marks: [
      Plot.dot(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"})),
      Plot.crosshairX(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"}))
    ]
  });
}

export async function crosshairDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
      Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
    ]
  });
}

export async function crosshairDotFacet() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fy: "species", stroke: "sex"}),
      Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fy: "species"})
    ]
  });
}

export async function crosshairHexbin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.hexagon(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"})),
      Plot.crosshair(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"}))
    ]
  });
}

export async function crosshairLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 60,
    marginRight: 40,
    marks: [Plot.lineY(aapl, {x: "Date", y: "Close"}), Plot.crosshairX(aapl, {x: "Date", y: "Close"})]
  });
}
