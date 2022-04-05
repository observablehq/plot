import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const agediff = await d3.csv("data/actor_character_age_difference.csv", d3.autoType);
  return Plot.plot({
    facet: {
      data: agediff,
      y: "title",
      marginRight: 150
    },
    marks: [
      Plot.tickX(
        agediff,
        Plot.groupZ({ x: "median" }, {
            x: "age_difference",
            z: "title",
            stroke: "red",
            sort: {fy: "x"}
        })
      ), // only for sorting
      Plot.rectY(
        agediff,
        Plot.binX({ y: "count" }, { x: "age_difference", thresholds: 10 })
      )
    ]
  });
}
