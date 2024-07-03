import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function functionContour() {
  return Plot.plot({
    color: {
      type: "diverging"
    },
    marks: [
      Plot.contour({
        fill: (x, y) => x * y * Math.sin(x) * Math.cos(y),
        stroke: "currentColor",
        x1: 0,
        y1: 0,
        x2: 4 * Math.PI,
        y2: 4 * Math.PI * (350 / 580),
        thresholds: d3.ticks(-80, 50, 10) // testing explicit thresholds
      })
    ]
  });
}

export async function functionContourFaceted() {
  function lin(x) {
    return x / (4 * Math.PI);
  }
  return Plot.plot({
    height: 580,
    color: {type: "diverging"},
    fx: {tickFormat: (f) => f?.name},
    fy: {tickFormat: (f) => f?.name},
    marks: [
      Plot.contour(undefined, {
        fill: (x, y, {fx, fy}) => fx(x) * fy(y),
        fx: [Math.sin, Math.sin, lin, lin],
        fy: [Math.cos, lin, lin, Math.cos],
        x1: 0,
        y1: 0,
        x2: 4 * Math.PI,
        y2: 4 * Math.PI,
        interval: 0.2
      }),
      Plot.frame()
    ]
  });
}

export async function functionContourFaceted2() {
  function lin(x) {
    return x / (4 * Math.PI);
  }
  return Plot.plot({
    height: 580,
    color: {type: "diverging"},
    fx: {tickFormat: (f) => f?.name},
    fy: {tickFormat: (f) => f?.name},
    marks: [
      Plot.contour({
        fill: (x, y, {fx, fy}) => fx(x) * fy(y),
        fx: [Math.sin, Math.sin, lin, lin],
        fy: [Math.cos, lin, lin, Math.cos],
        x1: 0,
        y1: 0,
        x2: 4 * Math.PI,
        y2: 4 * Math.PI,
        thresholds: 10
      }),
      Plot.frame()
    ]
  });
}
