import * as Plot from "@observablehq/plot";

export async function localeFrAxis() {
  return Plot.plot({locale: "fr", x: {domain: [0, 10e3]}});
}
