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

/** The geo mark with the tip option. */
export async function geoTip() {
  const [london, boroughs] = await getLondonBoroughs();
  const access = await getLondonAccess();
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

/** The geo mark with the tip option and the centroid transform. */
export async function geoTipCentroid() {
  const [london, boroughs] = await getLondonBoroughs();
  const access = await getLondonAccess();
  return Plot.plot({
    width: 900,
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    color: {scheme: "RdYlBu", pivot: 0.5},
    marks: [
      Plot.geo(
        access,
        Plot.centroid({
          fx: "year",
          geometry: (d) => boroughs.get(d.borough),
          fill: "access",
          stroke: "var(--plot-background)",
          strokeWidth: 0.75,
          channels: {borough: "borough"},
          tip: true
        })
      )
    ]
  });
}

/** The geo mark with the tip option and the poi transform. */
export async function geoTipPoi() {
  const [london, boroughs] = await getLondonBoroughs();
  const access = await getLondonAccess();
  return Plot.plot({
    width: 900,
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    color: {scheme: "RdYlBu", pivot: 0.5},
    marks: [
      Plot.geo(
        access,
        Plot.poi({
          fx: "year",
          geometry: (d) => boroughs.get(d.borough),
          fill: "access",
          stroke: "var(--plot-background)",
          strokeWidth: 0.75,
          channels: {borough: "borough"},
          tip: true
        })
      )
    ]
  });
}
/** The geo mark with the tip option and the geoCentroid transform. */
export async function geoTipGeoCentroid() {
  const [london, boroughs] = await getLondonBoroughs();
  const access = await getLondonAccess();
  return Plot.plot({
    width: 900,
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    color: {scheme: "RdYlBu", pivot: 0.5},
    marks: [
      Plot.geo(
        access,
        Plot.geoCentroid({
          fx: "year",
          geometry: (d) => boroughs.get(d.borough),
          fill: "access",
          stroke: "var(--plot-background)",
          strokeWidth: 0.75,
          channels: {borough: "borough"},
          tip: true
        })
      )
    ]
  });
}

function getFirstPoint(feature) {
  return feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates[0][0]
    : feature.geometry.coordinates[0][0][0];
}

/** The geo mark with the tip option and x and y channels. */
export async function geoTipXY() {
  const [london, boroughs] = await getLondonBoroughs();
  const access = await getLondonAccess();
  return Plot.plot({
    width: 900,
    projection: {type: "transverse-mercator", rotate: [2, 0, 0], domain: london},
    color: {scheme: "RdYlBu", pivot: 0.5},
    marks: [
      Plot.geo(access, {
        x: (d) => getFirstPoint(boroughs.get(d.borough))[0],
        y: (d) => getFirstPoint(boroughs.get(d.borough))[1],
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

async function getLondonBoroughs() {
  const london = feature(await d3.json("data/london.json"), "boroughs");
  const boroughs = new Map(london.features.map((d) => [d.id, d]));
  return [london, boroughs];
}

async function getLondonAccess() {
  return (await d3.csv<any>("data/london-car-access.csv", d3.autoType)).flatMap(({borough, y2001, y2011, y2021}) => [
    {borough, year: "2001", access: y2001},
    {borough, year: "2011", access: y2011},
    {borough, year: "2021", access: y2021}
  ]);
}
