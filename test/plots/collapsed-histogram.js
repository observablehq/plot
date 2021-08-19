import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.rectY([1, 1, 1], Plot.binX()).plot();
}
