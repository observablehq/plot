import * as Plot from "@observablehq/plot";

export function radiusLegend() {
  return Plot.plot({r: {label: "radial", domain: [0, 4500], range: [0, 100]}}).legend("r");
}
