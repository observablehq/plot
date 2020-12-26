import * as Plot from "@observablehq/plot";
import {cumsum} from "d3-array";
import {randomLcg, randomNormal} from "d3-random";

const random = randomLcg(42);

export default async function() {
  return Plot.plot({
    marks: [
      Plot.lineY(cumsum({length: 500}, randomNormal.source(random)()))
    ]
  });
}
