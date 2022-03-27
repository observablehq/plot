import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {composeInitialize} from "../../src/transforms/basic.js";

function remap(outputs = {}, options) {
  return composeInitialize(options, (data, facets, channels, scales) => {
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

// In the following, darker and Plot.dodgeY are interchangeable
export default async function() {
  return Plot.plot({
    marginTop: 10,
    nice: true,
    marks: [
      Plot.dotX(
        Array.from({ length: 150 }, d3.randomLogNormal.source(d3.randomLcg(42))()),
        Plot.dodgeY("middle", remap({
          fill: v => d3.rgb(v).darker(0.7).formatHex()
        }, {
          x: (d) => d,
          fill: (d) => d
        }))
      )
    ],
    height: 170
  });
}
