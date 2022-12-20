import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

export default async function () {
  const [[counties, statemesh], elections] = await Promise.all([
    d3.json("data/us-counties-10m.json").then((us) => [feature(us, us.objects.counties), mesh(us, us.objects.states)]),
    d3.csv("data/us-presidential-election-2020.csv")
  ]);
  const geom = new Map(counties.features.map((d) => [d.id, d]));
  return Plot.plot({
    width: 960,
    height: 600,
    projection: "albers-usa",
    marks: [
      Plot.geo(statemesh),
      Plot.vector(
        elections,
        Plot.geoCentroid({
          geometry: ({fips}) => geom.get(fips),
          filter: (d) => d.votes > 0,
          anchor: "start",
          sort: (d) => Math.abs(+d.results_trumpd - +d.results_bidenj),
          stroke: (d) => (+d.results_trumpd > +d.results_bidenj ? "red" : "blue"),
          length: (d) => Math.sqrt(Math.abs(+d.margin2020 * +d.votes)),
          rotate: (d) => (+d.results_bidenj < +d.results_trumpd ? 60 : -60)
        })
      )
    ]
  });
}
