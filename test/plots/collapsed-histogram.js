import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.rectX([1, 1, 1], Plot.binY()).plot();
}
