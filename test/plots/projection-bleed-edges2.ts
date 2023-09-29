import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function projectionBleedEdges2() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    width: 600,
    height: 600,
    facet: {x: [1, 2], data: [1, 2]},
    projection: {
      type: "azimuthal-equidistant",
      rotate: [90, -90],
      domain: d3.geoCircle().center([0, 90]).radius(85)(),
      clip: "frame",
      inset: -185
    },
    marks: [Plot.graticule(), Plot.geo(land, {fill: "#ccc", stroke: "currentColor"}), Plot.frame({stroke: "white"})]
  });
}
