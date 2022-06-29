import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.boxX([0, 3, 4.4, 4.5, 4.6, 5, 7]).plot();
}
