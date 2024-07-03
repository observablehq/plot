import * as Plot from "@observablehq/plot";

export async function percentNull() {
  const time = [1, 2, 3, 4, 5];
  const value = [null, null, 1, null, null];
  return Plot.dot(time, {x: time, y: value}).plot({y: {percent: true}});
}
