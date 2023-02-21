import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function frameCorners() {
  return Plot.frame({rx: 16, ry: 10}).plot();
}

const marks = [
  Plot.frame({anchor: "left", stroke: "red", strokeWidth: 4}),
  Plot.frame({anchor: "right", stroke: "green", strokeWidth: 4}),
  Plot.frame({anchor: "top", stroke: "blue", strokeWidth: 4}),
  Plot.frame({anchor: "bottom", stroke: "black", strokeWidth: 4})
];

export async function frameSides() {
  return Plot.plot({width: 350, height: 250, margin: 2, marks});
}

export async function frameSidesXY() {
  return Plot.plot({width: 350, height: 250, x: {domain: [0, 1]}, y: {domain: [0, 1]}, marks});
}

export async function frameSidesX() {
  return Plot.plot({width: 350, height: 250, x: {domain: [0, 1]}, marks});
}

export async function frameSidesY() {
  return Plot.plot({width: 350, height: 250, y: {domain: [0, 1]}, marks});
}

export async function futureSplom() {
  const data = {columns: ["A", "B", "C"]};
  return Plot.plot({
    width: 400,
    height: 400,
    fx: {domain: data.columns, axis: null},
    fy: {domain: data.columns, axis: null},
    x: {type: "linear", domain: [-1.5, 1.5]},
    y: {type: "linear", domain: [-1.5, 1.5]},
    marks: [
      Plot.gridX({ticks: 7}),
      Plot.gridY({ticks: 7}),
      Plot.axisX({facetAnchor: "bottom", ticks: 3}),
      Plot.axisY({facetAnchor: "left", ticks: 3}),
      Plot.text(
        d3.cross(data.columns, data.columns).filter(([key1, key2]) => key2 !== key1),
        {fx: "0", fy: "1", text: () => "*", frameAnchor: "middle"}
      ),
      Plot.axisFx({label: null, frameAnchor: "middle", dy: 10, facetAnchor: "empty"}),
      Plot.frame({facetAnchor: "empty"})
    ]
  });
}
