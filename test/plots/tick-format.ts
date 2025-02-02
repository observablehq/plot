import * as Plot from "@observablehq/plot";

export async function tickFormatEmptyDomain() {
  return Plot.plot({y: {tickFormat: "%W"}, marks: [Plot.barX([]), Plot.frame()]});
}

export async function tickFormatEmptyFacetDomain() {
  return Plot.plot({fy: {tickFormat: "%W"}, marks: [Plot.barX([]), Plot.frame()]});
}
