import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/simpsons.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    padding: 0.05,
    style: "overflow: visible;",
    x: {
      axis: "top",
      label: "Episode",
      labelAnchor: "middle" // TODO default since ordinal scale
    },
    y: {
      label: "Season",
      labelAnchor: "middle" // TODO default since ordinal scale
    },
    color: {
      type: "linear",
      scheme: "PiYG",
      unknown: "#ddd"
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
        text: (d) => (d.imdb_rating == null ? "-" : d.imdb_rating.toFixed(1)),
        title: "title"
      })
    ]
  });
}
