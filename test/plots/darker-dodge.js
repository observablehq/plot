import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {remap} from "../transforms/remap.js";

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
