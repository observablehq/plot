import * as Plot from "@observablehq/plot";
import {sort, descending} from "d3-array";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const alphabet = await csv("data/alphabet.csv", autoType);
  return Plot.plot({
    x: {
      label: "Frequency (%) →",
      grid: true
    },
    y: {
      domain: sort(alphabet, (a, b) => descending(a.frequency, b.frequency)).map(d => d.letter),
      invert: true, // TODO implicitly invert when band or point in y
      label: null
    },
    marks: [
      Plot.barX(alphabet, {x: d => d.frequency * 100, y: "letter"}),
      Plot.ruleX([0])
    ],
    height: 580
  });
}
