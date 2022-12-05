import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-110m.json");
  const domain = feature(
    world,
    world.objects.countries.geometries.find((d) => d.properties.name === "Antarctica")
  );
  return Plot.plot({
    width: 600,
    height: 600,
    projection: {
      type: "azimuthal-equidistant",
      clipAngle: 30,
      domain: {type: "Sphere"},
      inset: -20,
      clip: "frame",
      rotate: [0, 90]
    },
    marks: [Plot.graticule(), Plot.geo(domain, {fill: "currentColor"}), Plot.sphere()]
  });
}
