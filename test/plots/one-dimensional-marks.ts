import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// arrow
export async function oneDimensionalArrow() {
  const income = await d3.csv<any>("data/gender-income.csv", d3.autoType);
  return Plot.plot({
    width: 928,
    marginLeft: 60,
    x: {tickSpacing: 40, nice: true},
    fx: {
      domain: ["Low income", "Lower middle income", "Upper middle income", "High income"]
    },
    fy: {tickFormat: "d"},
    facet: {
      data: income,
      y: "year",
      x: "group"
    },
    marks: [Plot.frame(), Plot.arrow(income, Plot.groupZ({x1: "min", x2: "max"}, {x1: "value", x2: "value"}))]
  });
}

// line
export async function oneDimensionalLine() {
  const income = await d3.csv<any>("data/gender-income.csv", d3.autoType);
  return Plot.plot({
    width: 928,
    marginLeft: 60,
    x: {tickSpacing: 40, nice: true},
    fx: {
      domain: ["Low income", "Lower middle income", "Upper middle income", "High income"]
    },
    fy: {tickFormat: "d"},
    facet: {
      data: income,
      y: "year",
      x: "group"
    },
    marks: [Plot.frame(), Plot.line(income, {x: "value"}), Plot.dotX(income, {x: "value", fill: "gender", r: 5})]
  });
}

// link
export async function oneDimensionalLink() {
  const income = await d3.csv<any>("data/gender-income.csv", d3.autoType);
  return Plot.plot({
    width: 928,
    marginLeft: 60,
    x: {tickSpacing: 40, nice: true},
    fx: {
      domain: ["Low income", "Lower middle income", "Upper middle income", "High income"]
    },
    fy: {tickFormat: "d"},
    facet: {
      data: income,
      y: "year",
      x: "group"
    },
    marks: [
      Plot.frame(),
      Plot.link(income, Plot.groupZ({x1: "min", x2: "max"}, {x1: "value", x2: "value"})),
      Plot.dotX(income, {x: "value", fill: "gender", r: 5})
    ]
  });
}
