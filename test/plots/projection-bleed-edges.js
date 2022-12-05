import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const domain = feature(world, world.objects.land);
  const width = 600;
  return Plot.plot({
    width: width,
    height: width,
    margin: -1,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [45, -90],
      domain: {type: "Sphere"},
      clipAngle: 31,
      inset: -width * (Math.SQRT1_2 - 0.5) // extend to corners instead of edges
    },
    marks: [Plot.graticule(), Plot.geo(domain, {fill: "#ccc", stroke: "currentColor"})]
  });
}
