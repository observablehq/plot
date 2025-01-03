import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

const transform = (data, facets) => ({data, facets: facets.map((I) => I.slice(1))});

export async function usCountyVoronoi() {
  const counties = await d3
    .json<any>("data/us-counties-10m.json")
    .then((us) => feature(us, us.objects.counties).features);
  return Plot.plot({
    projection: "albers",
    marks: [
      Plot.voronoi(counties, Plot.geoCentroid({transform, stroke: "red"})),
      Plot.voronoi(counties, Plot.centroid({transform, stroke: "blue", mixBlendMode: "multiply"}))
    ]
  });
}

export async function usCountyVoronoiMesh() {
  const counties = await d3
    .json<any>("data/us-counties-10m.json")
    .then((us) => feature(us, us.objects.counties).features);
  return Plot.plot({
    projection: "albers",
    marks: [
      Plot.voronoiMesh(counties, Plot.geoCentroid({transform, stroke: "red", strokeOpacity: 1})),
      Plot.voronoiMesh(counties, Plot.centroid({transform, stroke: "blue", strokeOpacity: 1, mixBlendMode: "multiply"}))
    ]
  });
}
