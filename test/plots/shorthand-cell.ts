import * as Plot from "@observablehq/plot";

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
