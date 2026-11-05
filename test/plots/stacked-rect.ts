import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function stackedRect() {
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    marks: [
      Plot.rectX(
        {length: 20},
        {
          x: (d, i) => i,
          fill: (d, i) => i,
          insetLeft: 1,
          offset: "normalize"
        }
      )
    ]
  });
});
