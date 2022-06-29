import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.ruleX([1, 2, 3], Plot.dodgeY()).plot();
}
