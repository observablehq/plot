import * as Plot from "@observablehq/plot";

export async function dodgeTick() {
  return Plot.tickX([1, 2, 3], Plot.dodgeY()).plot();
}
