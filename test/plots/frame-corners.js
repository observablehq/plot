import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.frame({rx: 16, ry: 10}).plot();
}
