import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {remap} from "../transforms/remap.js";

export default async function () {
  const random = d3.randomNormal.source(d3.randomLcg(42))(0, 7);
  const data = await d3.csv("data/cars.csv", d3.autoType);
  return Plot.plot({
    height: 350,
    nice: true,
    y: {
      type: "band",
      grid: true,
      reverse: true
    },
    color: {
      legend: true
    },
    marks: [
      Plot.dot(
        data,
        remap(
          {y: (d) => d + random()},
          {x: "weight (lb)", y: "cylinders", fill: "power (hp)", stroke: "white", strokeWidth: 0.5}
        )
      )
    ]
  });
}
