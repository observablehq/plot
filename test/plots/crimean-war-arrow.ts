import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function crimeanWarArrow() {
  const crimea = await d3.csv<any>("data/crimean-war.csv", d3.autoType);
  const causes = crimea.columns.slice(2);
  const data = causes.flatMap((cause) => crimea.map(({date, [cause]: deaths}) => ({date, cause, deaths})));
  return Plot.plot({
    x: {tickFormat: "%b", label: null},
    marks: [Plot.ruleY([0]), Plot.lineY(data, {x: "date", y: "deaths", stroke: "cause", markerMid: "arrow"})]
  });
}
