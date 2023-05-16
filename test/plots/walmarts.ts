import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";

export async function walmarts() {
  const [walmarts, statemesh] = await Promise.all([
    d3.tsv<any>("data/walmarts.tsv", d3.autoType),
    d3.json<any>("data/us-counties-10m.json").then((us) =>
      mesh(us, {
        type: "GeometryCollection",
        geometries: us.objects.states.geometries.filter((d) => d.id !== "02" && d.id !== "15")
      })
    )
  ]);
  return Plot.plot({
    width: 960,
    height: 600,
    projection: "albers-usa",
    color: {
      legend: true,
      label: "First year opened",
      scheme: "spectral"
    },
    r: {
      range: [0, 20]
    },
    marks: [
      Plot.geo(statemesh, {strokeOpacity: 0.25}),
      Plot.dot(
        walmarts,
        Plot.hexbin(
          {r: "count", fill: "min", title: "min"},
          {x: "longitude", y: "latitude", fill: "date", stroke: "white", title: "date"}
        )
      )
    ]
  });
}

export async function walmartsInlineFacetLabels() {
  const [walmarts, [statemesh, nation]] = await Promise.all([
    d3.tsv<any>("data/walmarts.tsv", d3.autoType),
    d3.json<any>("data/us-counties-10m.json").then((us) => [
      mesh(us, {
        type: "GeometryCollection",
        geometries: us.objects.states.geometries.filter((d) => d.id !== "02" && d.id !== "15")
      }),
      mesh(us, us.objects.nation)
    ])
  ]);
  return Plot.plot({
    projection: "albers",
    fx: {axis: "inline", interval: d3.utcYear.every(10)},
    insetTop: 5,
    marks: [
      Plot.geo(statemesh, {strokeOpacity: 0.2}),
      Plot.geo(nation),
      Plot.dot(walmarts, {fx: "date", x: "longitude", y: "latitude", r: 1.5, fill: "steelblue"})
    ]
  });
}
