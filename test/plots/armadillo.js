import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoArmadillo} from "d3-geo-projection";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    width: 960,
    height: 548,
    margin: 1,
    projection: {type: () => geoArmadillo().precision(0.2), clip: "sphere", domain: {type: "Sphere"}},
    marks: [Plot.geo(land, {fill: "currentColor"}), Plot.graticule(), Plot.sphere()]
  });
}
