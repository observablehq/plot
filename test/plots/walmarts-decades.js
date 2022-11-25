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
  const decade = Plot.valueof(walmarts, (d) => `${Math.floor(d.date.getUTCFullYear() / 10)}0’s`);
  const decades = d3.sort(new Set(decade));
  return Plot.plot({
    style: {overflow: "visible"},
    width: 900,
    height: 135,
    projection: "albers-usa",
    facet: {data: decades, x: decades},
    marks: [
      Plot.frame({strokeWidth: 0.25}),
      Plot.geometry(statemesh, {strokeOpacity: 0.25}),
      Plot.geometry(
        decades.map((y) => ({
          type: "MultiPoint",
          coordinates: walmarts.filter((d, i) => decade[i] < y).map((d) => [d.longitude, d.latitude])
        })),
        {facet: true, fill: "black", r: 1}
      ),
      Plot.geometry(
        decades.map((y) => ({
          type: "MultiPoint",
          coordinates: walmarts.filter((d, i) => decade[i] === y).map((d) => [d.longitude, d.latitude])
        })),
        {facet: true, fill: "brown", r: 1}
      )
    ]
  });
}
