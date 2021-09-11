import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const stargazers = await d3.csv("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    marginRight: 40,
    y: {
      grid: true,
      label: "↑ Stargazers"
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(stargazers, {x: "date", y: (_, i) => i}),
      Plot.text(stargazers, Plot.selectLast({x: "date", y: (_, i) => i, textAnchor: "start", dx: 3}))
    ]
  });
}
