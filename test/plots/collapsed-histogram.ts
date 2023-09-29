import * as Plot from "@observablehq/plot";

export async function collapsedHistogram() {
  return Plot.rectY([1, 1, 1], Plot.binX()).plot();
}
