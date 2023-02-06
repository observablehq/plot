import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    facet: {data: [0, 1], x: [0, 1]},
    projection: "equal-earth",
    marks: [
      Plot.geo(land, {fill: "currentColor"}),
      Plot.graticule(),
      Plot.sphere(),
      Plot.frame({stroke: "red", strokeDasharray: 4})
    ]
  });
}
