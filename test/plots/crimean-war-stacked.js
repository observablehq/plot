import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const crimea = await d3.csv("data/crimean-war.csv", d3.autoType);
  const causes = crimea.columns.slice(2);
  const data = causes.flatMap(cause => crimea.map(({date, [cause]: deaths}) => ({date, cause, deaths})));
  return Plot.plot({
    x: {
      tickFormat: d3.utcFormat("%b"),
      label: null
    },
    marks: [
      Plot.ruleY([0]),
      Plot.barY(data, Plot.stackY({x: "date", y: "deaths", fill: "cause", reverse: true}))
    ]
  });
}
