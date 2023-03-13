import * as Plot from "@observablehq/plot";

export async function infinityLog() {
  return Plot.dotX([NaN, 0.2, 0, 1, 2, 1 / 0]).plot({x: {type: "log", tickFormat: "f"}});
}
