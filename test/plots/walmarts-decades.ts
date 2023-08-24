import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";

export async function walmartsDecades() {
  const [walmarts, statemesh] = await Promise.all([
    d3.tsv<any>("data/walmarts.tsv", d3.autoType),
    d3.json<any>("data/us-counties-10m.json").then((us) =>
      mesh(us, {
        type: "GeometryCollection",
        geometries: us.objects.states.geometries.filter((d) => d.id !== "02" && d.id !== "15")
      })
    )
  ]);
  const decade = (d) => Math.floor(d.date.getUTCFullYear() / 10) * 10;
  const coordinate = (d) => [d.longitude, d.latitude];
  const decades = d3.sort(new Set(walmarts.map(decade)));
  return Plot.plot({
    width: 960,
    height: 150,
    marginLeft: 0,
    marginRight: 0,
    projection: "albers-usa",
    fx: {tickFormat: (d) => `${d}’s`, padding: 0},
    facet: {data: decades, x: decades},
    marks: [
      Plot.geo(statemesh, {strokeOpacity: 0.25}),
      Plot.geo(decades, {
        geometry: (y) => ({type: "MultiPoint", coordinates: walmarts.filter((d) => decade(d) < y).map(coordinate)}),
        fill: "black",
        r: 1
      }),
      Plot.geo(decades, {
        geometry: (y) => ({type: "MultiPoint", coordinates: walmarts.filter((d) => decade(d) === y).map(coordinate)}),
        fill: "red",
        r: 1
      })
    ]
  });
}

export async function walmartsAdditions() {
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
    width: 200,
    projection: "albers-usa",
    fy: {interval: "5 years", axis: "right", tickFormat: "%Y—", reverse: true},
    marks: [
      Plot.geo(statemesh, {strokeOpacity: 0.25}),
      Plot.raster(walmarts, {
        pixelSize: 1.5,
        imageRendering: "pixelated",
        fy: "date",
        x: "longitude",
        y: "latitude",
        fill: "date"
      })
    ]
  });
}
