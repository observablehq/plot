import * as Plot from "@observablehq/plot";

export async function logTickFormatFunction() {
  return Plot.plot({x: {type: "log", domain: [1, 4200], tickFormat: Plot.formatNumber()}});
}

export async function logTickFormatFunctionSv() {
  return Plot.plot({x: {type: "log", domain: [1, 4200], tickFormat: Plot.formatNumber("sv-SE")}});
}
