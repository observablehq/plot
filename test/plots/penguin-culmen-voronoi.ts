import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinCulmenVoronoi() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "currentColor", r: 1.5}),
      Plot.voronoi(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "species", tip: true})
    ]
  });
}

export async function penguinCulmenVoronoiExclude() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const xy = {fx: "species", x: "culmen_depth_mm", y: "culmen_length_mm"};
  return Plot.plot({
    inset: 10,
    marks: [
      Plot.frame(),
      Plot.dot(penguins, {...xy, facet: "exclude", fill: "currentColor", r: 1.5}),
      Plot.dot(penguins, {...xy, facet: "include", fillOpacity: 0.25, fill: "currentColor", r: 1.5}),
      Plot.voronoiMesh(penguins, {...xy, facet: "exclude"}),
      Plot.voronoi(
        penguins,
        Plot.pointer({
          ...xy,
          facet: "exclude",
          stroke: "species",
          fill: "species",
          fillOpacity: 0.2,
          maxRadius: Infinity
        })
      )
    ]
  });
}

export async function penguinCulmenVoronoiExcludeHex() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const xy = {fx: "species", x: "culmen_depth_mm", y: "culmen_length_mm"};
  return Plot.plot({
    inset: 20,
    marks: [
      Plot.frame(),
      Plot.dot(penguins, Plot.hexbin({}, {...xy, facet: "exclude", stroke: "species", fill: "species"})),
      Plot.voronoiMesh(penguins, Plot.hexbin({}, {...xy, facet: "exclude", strokeOpacity: 1})),
      Plot.voronoi(
        penguins,
        Plot.pointer(Plot.hexbin({}, {...xy, facet: "exclude", strokeWidth: 2, maxRadius: Infinity}))
      )
    ]
  });
}
