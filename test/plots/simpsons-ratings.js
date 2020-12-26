import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/simpsons.csv", autoType);
  return Plot.plot({
    grid: true,
    padding: 0.05,
    x: {
      label: "Episode",
      axis: "top"
    },
    y: {
      label: "Season"
    },
    color: {
      scheme: "PiYG"
    },
    height: 640,
    marks: [
      Plot.cell(data, {
        x: "number_in_season",
        y: "season",
        fill: "imdb_rating"
      }),
      Plot.text(data, {
        x: "number_in_season",
        y: "season",
        text: d => d.imdb_rating && d.imdb_rating.toFixed(1),
        title: "title"
      })
    ]
  });
}
