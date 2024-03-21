import * as Plot from "@observablehq/plot";

export async function autoHeightEmpty() {
  return Plot.rectY([], {x: "date", y: "visitors", fy: "path"}).plot();
}
