import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinQuantileUnknown() {
  const sample = (await d3.csv("data/penguins.csv", d3.autoType)).map((d, i) => ({
    ...d,
    body_mass_g: i % 7 === 0 ? NaN : d.body_mass_g
  }));
  return Plot.tickX(sample, {x: "culmen_length_mm", stroke: "body_mass_g"}).plot({
    color: {type: "quantile", n: 5, scheme: "blues", unknown: "red", legend: true}
  });
}

export async function penguinQuantileEmpty() {
  const sample = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.tickX(sample, {x: "culmen_length_mm", stroke: () => null}).plot({
    color: {type: "quantile", n: 5, scheme: "blues", unknown: "red"}
  });
}
