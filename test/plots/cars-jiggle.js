import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {remap} from "../transforms/remap.js";

const random = d3.randomNormal.source(d3.randomLcg(42))(0, 7);

export default async function() {
  const data = await d3.csv("data/cars.csv", d3.autoType);
  return Plot.plot({
    height: 350,
    y: {type: "band", reverse: true, grid: true},
    color: {nice: true, scheme: "warm", reverse: true, legend: true},
    nice: true,
    marks: [
      Plot.dot(data, remap({y: d => d + random()}, {
        x: "weight (lb)",
        y: "cylinders",
        fill: "power (hp)",
        stroke: "white",
        strokeWidth: 0.5
      }))
    ]
  });
}
