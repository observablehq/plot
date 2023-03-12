import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function diamondsCaratPrice() {
  const data = await d3.csv<any>("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    height: 640,
    marginLeft: 44,
    color: {
      scheme: "bupu",
      type: "symlog"
    },
    marks: [Plot.rect(data, Plot.bin({fill: "count"}, {x: "carat", y: "price", thresholds: 100}))]
  });
}
