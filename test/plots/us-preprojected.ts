import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

export async function usPreprojected() {
  const [nation, statemesh] = await Promise.all([
    d3.json<any>("data/counties-albers-10m.json").then((us) => feature(us, us.objects.nation)),
    d3.json<any>("data/us-counties-10m.json").then((us) => mesh(us, us.objects.states))
  ]);
  return Plot.plot({
    width: 975,
    height: 610,
    projection: "albers-usa",
    marks: [
      Plot.geo(nation, {fill: "#dedede", geometry: {value: Plot.identity, scale: null}}),
      Plot.geo(statemesh, {stroke: "#fff"})
    ]
  });
}
