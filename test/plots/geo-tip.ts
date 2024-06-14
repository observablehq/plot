import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function geoText() {
  const london = feature(await d3.json("data/london.json"), "boroughs");
  return Plot.plot({
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    marks: [
      Plot.geo(london),
      Plot.text(london.features, Plot.centroid({text: "id", stroke: "var(--plot-background)", fill: "currentColor"}))
    ]
  });
}

export async function geoTip() {
  const london = feature(await d3.json("data/london.json"), "boroughs");
  const wide = await d3.csv<any>("data/london-car-access.csv", d3.autoType);
  const access = wide.flatMap(({borough, y2001, y2011, y2021}) => [
    {borough, year: "2001", access: y2001},
    {borough, year: "2011", access: y2011},
    {borough, year: "2021", access: y2021}
  ]);
  const boroughs = new Map(london.features.map((d) => [d.id, d]));
  return Plot.plot({
    width: 900,
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    color: {scheme: "RdYlBu", pivot: 0.5},
    marks: [
      Plot.geo(access, {
        fx: "year",
        geometry: (d) => boroughs.get(d.borough),
        fill: "access",
        stroke: "var(--plot-background)",
        strokeWidth: 0.75,
        channels: {borough: "borough"},
        tip: true
      })
    ]
  });
}

export async function geoTip2() {
  const us = await d3.json<any>("data/us-counties-10m.json");
  const nation = feature(us, us.objects.nation);
  const states = feature(us, us.objects.states).features;
  return Plot.plot({
    projection: "albers-usa",
    marks: [
      Plot.geo(states, {strokeOpacity: 0.1, tip: true, title: (d) => d.properties.name}),
      Plot.geo(nation),
      Plot.dot(states, Plot.centroid({fill: "red", stroke: "black"}))
    ]
  });
}

export async function geoTipCentroid() {
  const london = feature(await d3.json("data/london.json"), "boroughs");
  const wide = await d3.csv<any>("data/london-car-access.csv", d3.autoType);
  const access = wide.flatMap(({borough, y2001, y2011, y2021}) => [
    {borough, year: "2001", access: y2001},
    {borough, year: "2011", access: y2011},
    {borough, year: "2021", access: y2021}
  ]);
  const boroughs = new Map(london.features.map((d) => [d.id, d]));
  return Plot.plot({
    width: 900,
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    color: {scheme: "RdYlBu", pivot: 0.5},
    marks: [
      Plot.geo(access, {
        fx: "year",
        geometry: (d) => boroughs.get(d.borough),
        fill: "access",
        stroke: "var(--plot-background)",
        strokeWidth: 0.75
      }),
      Plot.tip(
        access,
        Plot.pointer(
          Plot.geoCentroid({
            fx: "year",
            geometry: (d) => boroughs.get(d.borough),
            fill: "access",
            format: {x: null, y: null},
            channels: {borough: "borough"}
          })
        )
      )
    ]
  });
}
