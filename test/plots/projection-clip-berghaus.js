import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoBerghaus} from "d3-geo-projection";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    width: 600,
    height: 600,
    projection: {type: geoBerghaus, domain: {type: "Sphere"}},
    marks: [Plot.graticule({clip: "sphere"}), Plot.geo(land, {fill: "currentColor", clip: "sphere"}), Plot.sphere()]
  });
}
