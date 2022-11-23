import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  return Plot.plot({
    width: 960,
    height: 470,
    projection: {
      type: "equal-earth",
      rotate: [20, 40, 60]
    },
    marks: [
      Plot.geometry([{type: "Sphere"}, d3.geoGraticule10()])
    ]
  });
}
