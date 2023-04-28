import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function groupIntervalYear() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {tickFormat: "%Y"},
    marks: [Plot.barY(olympians, Plot.groupX({y: "count"}, Plot.quantizeX("5 years", {x: "date_of_birth"})))]
  });
}

// Simulates missing data; the gap for 1960 and 1965 should be visible.
export async function groupIntervalYearSparse() {
  const olympians = (await d3.csv<any>("data/athletes.csv", d3.autoType)).filter((d) => {
    const year = d.date_of_birth.getUTCFullYear();
    return year < 1960 || year >= 1970;
  });
  return Plot.plot({
    x: {tickFormat: "%Y"},
    marks: [Plot.barY(olympians, Plot.groupX({y: "count"}, Plot.quantizeX("5 years", {x: "date_of_birth"})))]
  });
}
