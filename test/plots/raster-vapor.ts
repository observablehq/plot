import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function vapor() {
  return d3
    .csvParseRows(await d3.text("data/water-vapor.csv"))
    .flat()
    .map((x) => (x === "99999.0" ? NaN : +x));
}

export async function rasterVapor() {
  return Plot.plot({
    color: {scheme: "blues"},
    x: {transform: (x) => x - 180},
    y: {transform: (y) => 90 - y},
    marks: [Plot.raster(await vapor(), {width: 360, height: 180})]
  });
}

export async function rasterVapor2() {
  return Plot.plot({
    color: {scheme: "blues", legend: true},
    x: {transform: (x) => x - 180},
    y: {transform: (y) => 90 - y},
    marks: [
      Plot.raster(await vapor(), {
        width: 360,
        height: 180
      }),
      Plot.raster(await vapor(), {
        width: 360,
        height: 180,
        fill: {value: (d) => (d > 4 ? "red" : null), scale: null}
      })
    ]
  });
}

export async function contourVapor() {
  return Plot.plot({
    width: 960,
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.contour(await vapor(), {
        fill: Plot.identity,
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interval: 0.25,
        blur: 0.5,
        stroke: "currentColor",
        strokeWidth: 0.5,
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}

export async function rasterVaporPeters() {
  const radians = Math.PI / 180;
  const sin = (y) => Math.sin(y * radians);
  const asin = (y) => Math.asin(y) / radians;
  return Plot.plot({
    width: Math.floor(30 + (500 * Math.PI) / 2),
    height: 500 + 20,
    marginLeft: 30,
    marginBottom: 20,
    y: {
      transform: sin,
      ticks: d3.ticks(-80, 80, 10).map(sin),
      tickFormat: (y) => Math.round(asin(y))
    },
    color: {
      scheme: "blues"
    },
    marks: [
      Plot.raster(await vapor(), {
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interpolate: "nearest"
      })
    ]
  });
}

export async function rasterVaporEqualEarth() {
  return Plot.plot({
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.raster(await vapor(), {
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interpolate: "random-walk",
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}

export async function rasterVaporEqualEarthBarycentric() {
  return Plot.plot({
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.raster(await vapor(), {
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interpolate: "barycentric",
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}
