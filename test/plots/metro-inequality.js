import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/metros.csv", autoType);
  return Plot.plot({
    grid: true,
    inset: 10,
    x: {
      type: "log",
      label: "Population →",
      tickFormat: "~s"
    },
    y: {
      label: "↑ Inequality"
    },
    marks: [
      Plot.dot(data, {x: "POP_1980", y: "R90_10_1980"})
    ]
  });
}
