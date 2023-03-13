import * as Plot from "@observablehq/plot";

export async function highCardinalityOrdinal() {
  return Plot.plot({
    color: {
      type: "ordinal"
    },
    marks: [Plot.cellX("ABCDEFGHIJKLMNOPQRSTUVWXYZ")]
  });
}
