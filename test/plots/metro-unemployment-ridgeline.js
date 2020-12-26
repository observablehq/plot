import * as Plot from "@observablehq/plot";
import {descending, max, rollups} from "d3-array";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/bls-metro-unemployment.csv", autoType);
  return Plot.plot({
    width: 960,
    height: 1080,
    marginLeft: 300,
    x: {
      label: null
    },
    y: {
      range: [20, -40]
    },
    fy: {
      domain: rollups(data, group => max(group, d => d.unemployment), d => d.division)
        .sort(([, a], [, b]) => descending(a, b))
        .map(([key]) => key),
      label: null
    },
    facet: {
      data,
      y: "division"
    },
    marks: [
      Plot.areaY(data, {x: "date", y: "unemployment", fill: "#eee"}),
      Plot.line(data, {x: "date", y: "unemployment"}),
      Plot.ruleY([0])
    ]
  });
}
