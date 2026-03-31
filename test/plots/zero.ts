import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function zeroNegativeY() {
  return Plot.lineY([-0.25, -0.15, -0.05]).plot({y: {zero: true}});
});

test(async function zeroPositiveY() {
  return Plot.lineY([0.25, 0.15, 0.05]).plot({y: {zero: true}});
});

test(async function zeroPositiveDegenerateY() {
  return Plot.lineY([0.25, 0.25, 0.25]).plot({y: {zero: true}});
});

test(async function zeroNegativeDegenerateY() {
  return Plot.lineY([-0.25, -0.25, -0.25]).plot({y: {zero: true}});
});
