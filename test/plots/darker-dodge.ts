import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {remap} from "../transforms/remap.js";

function darker(outputs: {[name: string]: number}, inputs) {
  return remap(
    Object.fromEntries(Object.entries(outputs).map(([name, value]) => [name, (v) => d3.lab(v).darker(value)])),
    inputs
  );
}

export async function darkerDodge() {
  const random = d3.randomLogNormal.source(d3.randomLcg(42))();
  return Plot.plot({
    height: 170,
    nice: true,
    marks: [
      Plot.dotX(
        Array.from({length: 150}, random),
        Plot.dodgeY({anchor: "middle"}, darker({stroke: 2}, {x: (d) => d, fill: (d) => d, stroke: (d) => d}))
      )
    ]
  });
}
