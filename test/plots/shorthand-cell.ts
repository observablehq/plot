import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function shorthandCell() {
  const matrix = [
    ["Jacob", "Olivia"],
    ["Mia", "Noah"],
    ["Noah", "Ava"],
    ["Ava", "Mason"],
    ["Olivia", "Noah"],
    ["Jacob", "Emma"],
    ["Ava", "Noah"],
    ["Noah", "Jacob"],
    ["Olivia", "Ava"],
    ["Mason", "Emma"],
    ["Jacob", "Mia"],
    ["Mia", "Jacob"],
    ["Emma", "Jacob"]
  ];
  return Plot.cell(matrix).plot();
}

export async function shorthandCellCategorical() {
  return Plot.cellX(d3.range(10)).plot({color: {scheme: "Tableau10"}});
}
