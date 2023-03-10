import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as aq from "arquero";

export async function diamondsBoxplot() {
  const diamonds = await d3.csv("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.boxX(diamonds, {x: "price", y: "clarity", sort: {y: "x"}})]
  });
}

export async function diamondsBoxplotArquero() {
  const diamonds = aq.from(await d3.csv("data/diamonds.csv", d3.autoType));
  return Plot.plot({
    marks: [Plot.boxX(diamonds, {x: "price", y: "clarity", sort: {y: "x"}})]
  });
}

export async function diamondsBoxplotColumnar() {
  const raw = await d3.csv("data/diamonds.csv", d3.autoType);
  const diamonds = {price: Plot.valueof(raw, "price"), clarity: Plot.valueof(raw, "clarity")};
  return Plot.plot({
    marks: [Plot.boxX(diamonds, {x: "price", y: "clarity", sort: {y: "x"}})]
  });
}
