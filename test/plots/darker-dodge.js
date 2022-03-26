import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {composeInitialize} from "../../src/transforms/basic.js";

const darker = (darker = 0.7, options = {}) => {
  if (typeof darker === "object") {
    options = darker;
    darker = "darker" in options ? options.darker : 0.7;
  }

  function darken(data, facets, channels, scales) {
    const F = channels.fill && new Array(channels.fill.value.length);
    const S = channels.stroke && new Array(channels.stroke.value.length);
    if (F) {
      for (const facet of facets) {
        for (const i of facet) {
          let v = channels.fill.value[i];
          if (channels.fill.scale === "color") v = scales.color(v);
          F[i] = d3.rgb(v).darker(darker).formatHex();
        }
      }
    }
    if (S) {
      for (const facet of facets) {
        for (const i of facet) {
          let v = channels.stroke.value[i];
          if (channels.stroke.scale === "color") v = scales.color(v);
          S[i] = d3.rgb(v).darker(darker).formatHex();
        }
      }
    }
    return {
      data,
      facets,
      channels: {
        ...(F && { fill: { value: F } }),
        ...(S && { stroke: { value: S } })
      }
    };
  }

  return composeInitialize(options, darken);
};

// In the following, darker and Plot.dodgeY are interchangeable
export default async function() {
  return Plot.plot({
    marginTop: 10,
    nice: true,
    marks: [
      Plot.dotX(
        Array.from({ length: 150 }, d3.randomLogNormal.source(d3.randomLcg(42))()),
        Plot.dodgeY("middle", darker({ x: (d) => d, fill: (d) => d }))
      )
    ],
    height: 170
  });
}
