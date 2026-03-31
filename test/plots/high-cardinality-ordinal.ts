import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function highCardinalityOrdinal() {
  return Plot.plot({
    color: {
      type: "ordinal"
    },
    marks: [Plot.cellX("ABCDEFGHIJKLMNOPQRSTUVWXYZ")]
  });
});
