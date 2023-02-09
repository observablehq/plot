import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

export default async function () {
  const [[states, statemesh], capitals] = await Promise.all([
    d3
      .json("data/us-counties-10m.json")
      .then((us) => [feature(us, us.objects.states), mesh(us, us.objects.states, (a, b) => a !== b)]),
    d3.csv("data/us-state-capitals.csv", d3.autoType)
  ]);
  return Plot.plot({
    width: 960,
    height: 600,
    projection: "albers-usa",
    marks: [
      Plot.geo(states, {fill: "#ccc"}),
      Plot.geo(statemesh, {stroke: "white"}),
      Plot.dot(capitals, {x: "longitude", y: "latitude", fill: "currentColor"}),
      Plot.text(capitals, {
        x: "longitude",
        y: "latitude",
        frameAnchor: "bottom",
        text: (d) => `${d.capital}\n${d.state}`,
        dy: -6
      })
    ]
  });
}
