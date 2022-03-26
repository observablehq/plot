import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/simpsons.csv", d3.autoType);
  return Plot.plot({
    height: 640,
    grid: true,
    x: {
      inset: 6,
      label: "IMDB rating →"
    },
    y: {
      label: "↑ Viewers (U.S., millions)"
    },
    color: {
      type: "quantize",
      legend: true
    },
    marks: [
      Plot.ruleY([0]),
      Plot.dot(data, {
        x: "imdb_rating",
        y: "us_viewers_in_millions",
        fill: "season",
        title: d => `${d.title} S${d.season}E${d.number_in_season}`
      })
    ]
  });
}
