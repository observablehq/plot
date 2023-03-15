import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function projectionRuleOrthographic() {
  const world = await d3.json<any>("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    projection: {
      type: "orthographic",
      rotate: [100, -30]
    },
    marks: [
      Plot.sphere(),
      Plot.geo(land, {fill: "currentColor"}),
      Plot.ruleX(d3.range(-180, 180, 10), {stroke: "red"}),
      Plot.ruleY(d3.range(-80, 80, 10), {stroke: "blue"})
    ]
  });
}
