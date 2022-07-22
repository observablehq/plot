import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const stargazers = await d3.csv("data/stargazers.csv", d3.autoType);
  const format = d3.utcFormat("%Y-%m-%d");
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Stargazers added per week"
    },
    marks: [
      Plot.rectY(
        stargazers,
        Plot.binX(
          {y: "count", title: (d, {x1, x2}) => `${format(x1)} to ${format(x2)}\n${d.length}`},
          {x: "date", thresholds: d3.utcWeek}
        )
      ),
      Plot.ruleY(
        stargazers,
        Plot.groupZ({y: "median"}, Plot.binX({y: "count", x: null}, {x: "date", stroke: "red", thresholds: d3.utcWeek}))
      ),
      Plot.ruleY([0])
    ]
  });
}
