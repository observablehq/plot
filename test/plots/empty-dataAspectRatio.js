import * as Plot from "@observablehq/plot";
import {svg} from "htl";

export async function emptyDataAspectRatio() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {type: "linear"},
    y: {type: "linear"},
    aspectRatio: 10,
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
