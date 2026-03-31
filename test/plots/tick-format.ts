import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function tickFormatEmptyDomain() {
  return Plot.plot({y: {tickFormat: "%W"}, marks: [Plot.barX([]), Plot.frame()]});
});

test(async function tickFormatEmptyFacetDomain() {
  return Plot.plot({fy: {tickFormat: "%W"}, marks: [Plot.barX([]), Plot.frame()]});
});
