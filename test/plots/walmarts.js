import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";

export default async function () {
  const [walmarts, statemesh] = await Promise.all([
    d3.tsv("data/walmarts.tsv", d3.autoType),
    d3.json("data/us-counties-10m.json").then((us) =>
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
