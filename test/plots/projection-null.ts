import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function projectionNull() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    projection: null,
    marks: [Plot.geo(land), Plot.graticule()]
  });
}
