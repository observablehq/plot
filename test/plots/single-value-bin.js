import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.rectY([3], Plot.binX()).plot();
}
