import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoBertin1953} from "d3-geo-projection";
import {merge} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-110m.json");
  const land = merge(
    world,
    world.objects.countries.geometries.filter((d) => d.properties.name !== "Antarctica")
  );
  return Plot.plot({
    width: 960,
    height: 302,
    marginRight: 44,
    marginLeft: 0,
    facet: {data: [1, 2], x: ["a", "b"]},
    projection: {type: geoBertin1953, domain: land},
    marks: [Plot.frame({stroke: "red"}), Plot.geo(land, {fill: "currentColor"})],
    style: "border: solid 1px blue"
  });
}
