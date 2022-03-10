import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {initialize} from "../../src/transforms/initialize.js";

function remap(outputs = {}, options) {
  return initialize(options, (data, facets, channels, scales) => {
    const newChannels = {};
    for (const [key, map] of Object.entries(outputs)) {
      const input = channels[key];
      if (input == null) throw new Error(`missing channel: ${key}`);
      const V = Array.from(input.value);
      if (input.scale != null) {
        const scale = scales[input.scale];
        if (scale != null) {
          for (let i = 0; i < V.length; ++i) V[i] = scale(V[i]);
        }
      }
      for (let i = 0; i < V.length; ++i) V[i] = map(V[i]);
      newChannels[key] = {value: V};
    }
    return {
      data,
      facets,
      channels: newChannels
    };
  });
}

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
