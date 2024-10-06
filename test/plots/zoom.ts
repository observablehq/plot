import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function zoomDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}).plot({grid: true, zoom: true});
}
