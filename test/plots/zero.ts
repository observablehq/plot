import * as Plot from "@observablehq/plot";

export async function zeroNegativeY() {
  return Plot.lineY([-0.25, -0.15, -0.05]).plot({y: {zero: true}});
}

export async function zeroPositiveY() {
  return Plot.lineY([0.25, 0.15, 0.05]).plot({y: {zero: true}});
}

export async function zeroPositiveDegenerateY() {
  return Plot.lineY([0.25, 0.25, 0.25]).plot({y: {zero: true}});
}

export async function zeroNegativeDegenerateY() {
  return Plot.lineY([-0.25, -0.25, -0.25]).plot({y: {zero: true}});
}
