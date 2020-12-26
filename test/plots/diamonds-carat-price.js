import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/diamonds.csv", autoType);
  return Plot.plot({
    height: 640,
    color: {
      scheme: "bupu",
      type: "symlog"
    },
    marks: [
      Plot.bin(data, {x: "carat", y: "price", thresholds: 100})
    ]
  });
}
