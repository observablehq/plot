import * as Plot from "@observablehq/plot";
import * as Arrow from "apache-arrow";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function arrowDates() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  const table = Arrow.tableFromJSON(athletes);
  return Plot.rectY(table, Plot.binX(undefined, {x: "date_of_birth"})).plot();
}
