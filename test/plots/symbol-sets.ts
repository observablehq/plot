import * as Plot from "@observablehq/plot";

export async function symbolSetFill() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    fill: "currentColor",
    symbol: (d, i) => i
  }).plot();
}

export async function symbolSetStroke() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    stroke: "currentColor",
    symbol: (d, i) => i
  }).plot();
}
