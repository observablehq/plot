import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function hrefFill() {
  return Plot.text(
    {length: 1},
    {
      text: ["click me"],
      x: 0,
      y: 0,
      fill: "red",
      href: [`https://google.com/search?q=12345`]
    }
  ).plot();
}
