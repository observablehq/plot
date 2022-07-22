import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const timestamps = Float64Array.of(
    1609459200000,
    1609545600000,
    1609632000000,
    1609718400000,
    1609804800000,
    1609891200000,
    1609977600000
  );
  return Plot.rectY(timestamps, Plot.binX({y: "count"}, {interval: d3.utcDay})).plot();
}
