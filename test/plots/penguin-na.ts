import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function penguinNA(tickFormat: (x: number) => any = undefined) {
  const sample = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const V = Plot.valueof(sample, "body_mass_g");
  const [min, max] = d3.extent(V);
  return Plot.tickX(sample, {x: V, stroke: (d) => (d.body_mass_g ? "black" : "red")}).plot({
    x: {unknown: 10, ticks: [NaN, ...d3.ticks(min, max, 7)], tickFormat}
  });
}

export async function penguinNA1() {
  return penguinNA();
}

export async function penguinNA2() {
  return penguinNA((d) => (isNaN(d) ? "N/A" : d));
}

export async function penguinNA3() {
  return penguinNA((d) => d);
}
