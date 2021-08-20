import * as Plot from "@observablehq/plot";
import {svg} from "htl";

export default async function() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {
      domain: "ABCDEFGH"
    },
    y: {
      line: true,
      domain: [0, 1]
    }
  });
}
