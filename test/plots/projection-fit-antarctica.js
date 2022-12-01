import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const land = feature(world, world.objects.land);
  const domain = feature(
    world,
    world.objects.countries.geometries.find((d) => d.properties.name === "Antarctica")
  );
  return Plot.plot({
    width: 600,
    height: 600,
    inset: 30,
    projection: {type: "azimuthal-equidistant", rotate: [0, 90], domain},
    marks: [Plot.geo(land, {fill: "#666"}), Plot.graticule(), Plot.geo(domain, {fill: "black"}), Plot.frame()]
  });
}
