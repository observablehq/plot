import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoBertin1953} from "d3-geo-projection";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    width: 960,
    height: 302,
    marginRight: 44,
    marginLeft: 0,
    facet: {data: [1, 2], x: ["a", "b"]},
    projection: ({width, height}) => geoBertin1953().fitSize([width, height], {type: "Sphere"}),
    marks: [Plot.frame({stroke: "red"}), Plot.geo(land, {fill: "currentColor"}), Plot.sphere({strokeWidth: 0.5})],
    style: "border: solid 1px blue"
  });
}
