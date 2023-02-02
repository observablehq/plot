import * as Plot from "@observablehq/plot";

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
