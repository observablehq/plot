import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-presidential-election-2020.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 640,
    inset: 12,
    grid: true,
    x: {
      label: "← Biden · Vote margin (%) · Trump →",
      labelAnchor: "center",
      tickFormat: "+f"
    },
    y: {
      type: "log",
      label: "↑ Total number of votes"
    },
    color: {
      scheme: "BuRd",
      symmetric: false
    },
    marks: [
      Plot.ruleX([0]),
      Plot.dot(
        data.filter(d => d.votes > 0),
        {
          x: "margin2020",
          y: "votes",
          fill: "margin2020",
          title: d => `${d.name}, ${recase(d.state)}
${[["Trump", d.results_trumpd], ["Biden", d.results_bidenj]]
  .sort(([, a], [, b]) => d3.descending(a, b))
  .map(([name, count]) => `${count.toLocaleString("en")} votes for ${name}`)
  .join("\n")}`,
          stroke: "currentColor",
          strokeWidth: 0.5
        }
      )
    ]
  });
}

function recase(hypenated) {
  return hypenated
    .split(/-/g)
    .map(part => `${part[0].toUpperCase()}${part.substring(1)}`)
    .join(" ");
}
