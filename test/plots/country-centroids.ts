import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function countryCentroids() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  const countries = feature(world, world.objects.countries).features;
  return Plot.plot({
    projection: "mercator",
    marks: [
      Plot.graticule(),
      Plot.geo(land, {fill: "#ddd"}),
      Plot.geo(countries, {stroke: "#fff"}),
      Plot.text(countries, Plot.geoCentroid({fill: "red", text: "id"})),
      Plot.text(countries, Plot.centroid({fill: "blue", text: "id"})),
      Plot.frame()
    ]
  });
}
