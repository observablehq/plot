import * as Plot from "@observablehq/plot";
import {svg} from "htl";

export default async function() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {},
    y: {},
    marks: [
      Plot.frame(),
      undefined,
      null,
      () => null,
      () => undefined,
      () => svg`<circle cx=50% cy=50% r=5 fill=green>`
    ]
  });
}
