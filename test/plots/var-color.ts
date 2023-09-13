import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function varColor() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    style: "--a: 0.5; --b: rgba(255, 0, 0, var(--a));",
    marks: [Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "var(--b)", sort: {y: "-x"}})]
  });
}

export async function varColor2() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    style: "--a: 0.5;",
    marks: [Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "rgba(255, 0, 0, var(--a))", sort: {y: "-x"}})]
  });
}

export async function varColorP3() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "color(display-p3 1 0.5 0)", sort: {y: "-x"}}).plot();
}
