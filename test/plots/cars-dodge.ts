import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function carsDodge() {
  const cars = await d3.csv<any>("data/cars.csv", d3.autoType);
  return Plot.plot({
    height: 200,
    x: {line: true},
    marks: [Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", sort: "weight (lb)"}))]
  });
}
