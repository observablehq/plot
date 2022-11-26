import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

export default async function () {
  const [[counties, statemesh], unemployment] = await Promise.all([
    d3
      .json("data/us-counties-10m.json")
      .then((us) => [feature(us, us.objects.counties), mesh(us, us.objects.states, (a, b) => a !== b)]),
    d3.csv("data/us-county-unemployment.csv").then((data) => new Map(data.map(({id, rate}) => [id, +rate])))
  ]);
  return Plot.plot({
    width: 960,
    height: 600,
    projection: "albers-usa",
    color: {
      scheme: "purd",
      domain: [1, 10],
      type: "quantize",
      n: 9,
      unknown: "#ccc",
      legend: true,
      label: "Unemployment (%)"
    },
    marks: [
      Plot.geo(counties, {fill: (d) => unemployment.get(d.id), title: (d) => d.properties.name}), // TODO string accessors for properties, id
      Plot.geo(statemesh, {stroke: "white"})
    ]
  });
}
