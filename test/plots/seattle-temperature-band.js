import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/seattle-weather.csv", autoType);
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Temperature (°C)"
    },
    color: {
      scheme: "RdBu",
      invert: true
    },
    marks: [
      Plot.ruleX(
        data,
        {
          x: "date",
          y1: "temp_min",
          y2: "temp_max",
          stroke: "temp_min"
        }
      )
    ]
  });
}
