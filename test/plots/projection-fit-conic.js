import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    projection: {
      type: "conic-equal-area",
      parallels: [-42, -5],
      rotate: [60, 0]
    },
    marks: [Plot.graticule(), Plot.geo(land, {fill: "currentColor"}), Plot.sphere()]
  });
}
