import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

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

export async function zeroDomainExplicit() {
  return Plot.plot({
    caption: "Explicit domain [1, 16] with zero: true → [0, 16]",
    x: {domain: [1, 16], ticks: 20, zero: true},
    marks: [Plot.dotX(d3.range(1, 17))]
  });
}

export async function zeroDomainExplicitNoZero() {
  return Plot.plot({
    caption: "Explicit domain [1, 16] with implicit zero → [1, 16]",
    x: {domain: [1, 16], ticks: 20},
    marks: [Plot.dotX(d3.range(1, 17))]
  });
}

export async function zeroDomainImplicit() {
  return Plot.plot({
    caption: "Implicit domain [1, 16] with implicit zero → [0, 16]",
    x: {ticks: 20},
    marks: [Plot.dotX(d3.range(1, 17))]
  });
}

export async function zeroDomainDisabled() {
  return Plot.plot({
    caption: "Implicit domain [1, 16] with zero: false → [1, 16]",
    x: {ticks: 20, zero: false},
    marks: [Plot.dotX(d3.range(1, 17))]
  });
}
