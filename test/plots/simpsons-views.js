import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/simpsons.csv", autoType);
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
