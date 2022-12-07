import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";

export default async function () {
  const [conus, countymesh] = await d3
    .json("data/us-counties-10m.json")
    .then((us) => [mesh(us, us.objects.states, (a, b) => a === b), mesh(us, us.objects.counties, (a, b) => a !== b)]);
  return Plot.plot({
    projection: {
      type: "albers-usa"
    },
    marks: [
      Plot.geo(conus, {strokeWidth: 1.5}),
      Plot.geo(countymesh, {strokeOpacity: 0.1}),
      Plot.frame({stroke: "red", strokeDasharray: 4})
    ]
  });
}
