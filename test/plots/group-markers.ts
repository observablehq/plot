import * as Plot from "@observablehq/plot";
import {range} from "d3";

export async function groupMarker() {
  return Plot.plot({
    aspectRatio: 1,
    axis: null,
    inset: 30,
    marks: [
      Plot.line(range(20, 200), {
        x: (i) => i * Math.sin(i / 40 + ((i % 5) * 2 * Math.PI) / 5),
        y: (i) => i * Math.cos(i / 40 + ((i % 5) * 2 * Math.PI) / 5),
        stroke: (i) => `arrow ${i % 5}`,
        strokeWidth: (i) => Math.round(1 + i / 40),
        marker: "dot"
      })
    ]
  });
}

export async function groupMarkerStart() {
  return Plot.plot({
    aspectRatio: 1,
    axis: null,
    inset: 30,
    marks: [
      Plot.line(range(500, 0, -1), {
        x: (i) => i * Math.sin(i / 100 + ((i % 5) * 2 * Math.PI) / 5),
        y: (i) => i * Math.cos(i / 100 + ((i % 5) * 2 * Math.PI) / 5),
        stroke: (i) => `arrow ${i % 5}`,
        strokeWidth: (i) => i / 100,
        markerStart: "circle-stroke"
      })
    ]
  });
}

export async function groupMarkerMid() {
  return Plot.plot({
    aspectRatio: 1,
    axis: null,
    inset: 30,
    marks: [
      Plot.line(range(20, 200), {
        x: (i) => i * Math.sin(i / 40 + ((i % 5) * 2 * Math.PI) / 5),
        y: (i) => i * Math.cos(i / 40 + ((i % 5) * 2 * Math.PI) / 5),
        stroke: (i) => `arrow ${i % 5}`,
        strokeWidth: (i) => Math.round(i / 40),
        markerMid: "dot"
      })
    ]
  });
}

export async function groupMarkerEnd() {
  return Plot.plot({
    aspectRatio: 1,
    axis: null,
    inset: 30,
    marks: [
      Plot.line(range(500), {
        x: (i) => i * Math.sin(i / 100 + ((i % 5) * 2 * Math.PI) / 5),
        y: (i) => i * Math.cos(i / 100 + ((i % 5) * 2 * Math.PI) / 5),
        stroke: (i) => `arrow ${i % 5}`,
        strokeWidth: (i) => i / 100,
        markerEnd: "arrow"
      })
    ]
  });
}
