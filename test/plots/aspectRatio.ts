import * as Plot from "@observablehq/plot";

export async function aspectRatioLinear() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {type: "linear", domain: [0, 10]},
    y: {type: "linear", domain: [10, 20]},
    aspectRatio: 1,
    marks: [Plot.frame()]
  });
}

export async function aspectRatioSqrt() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {type: "sqrt", domain: [0, 10]},
    y: {type: "sqrt", domain: [10, 20]},
    aspectRatio: 1,
    marks: [Plot.frame()]
  });
}

export async function aspectRatioLog() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {type: "log", domain: [1, 10]},
    y: {type: "log", domain: [10, 100]},
    aspectRatio: 1,
    marks: [Plot.frame()]
  });
}

export async function aspectRatioPoint() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {type: "point", domain: "ABCDEF"},
    y: {type: "point", domain: [1, 2, 3, 4, 5, 6]},
    aspectRatio: 1,
    marks: [Plot.frame()]
  });
}

export async function aspectRatioBand() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {type: "band", domain: "ABCDEF"},
    y: {type: "band", domain: [1, 2, 3, 4, 5, 6]},
    aspectRatio: 1,
    marks: [Plot.frame()]
  });
}
