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
      Plot.ruleY(d3.range(-80, 81, 10), {stroke: "blue"})
    ]
  });
}

export async function projectionRuleEqualEarth() {
  return Plot.plot({
    projection: "equal-earth",
    marks: [
      Plot.sphere(),
      Plot.ruleX(d3.range(-180, 180, 10), {strokeOpacity: 0.2, y1: -90, y2: 90}),
      Plot.ruleY(d3.range(-80, 81, 10), {x1: (d) => (d * d) / 90, x2: (d) => 180 - (d * d) / 90, strokeOpacity: 0.2})
    ]
  });
}
