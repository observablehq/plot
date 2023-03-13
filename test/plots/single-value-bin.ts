import * as Plot from "@observablehq/plot";

export async function singleValueBin() {
  return Plot.rectY([3], Plot.binX()).plot();
}
