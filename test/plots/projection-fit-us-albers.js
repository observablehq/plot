import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {mesh} from "topojson-client";

export default async function () {
  const [conus, countymesh] = await d3
    .json("data/us-counties-10m.json")
    .then((us) => [
      mesh(us, filter48(us.objects.states), (a, b) => a === b),
      mesh(us, filter48(us.objects.counties), (a, b) => a !== b)
    ]);
  return Plot.plot({
    width: 960,
    height: 600,
    projection: {
      type: "conic-equal-area",
      rotate: [96, 0],
      parallels: [29.5, 45.5],
      domain: conus
    },
    marks: [Plot.geo(conus, {strokeWidth: 1.5}), Plot.geo(countymesh, {strokeOpacity: 0.1})]
  });
}

// Removes Alaska, Hawaii, Puerto Rico, and U.S. territories.
function filter48({geometries}) {
  return {
    type: "GeometryCollection",
    geometries: geometries.filter(
      ({id}) => id.slice(0, 2) !== "02" && id.slice(0, 2) !== "15" && id.slice(0, 2) <= "56"
    )
  };
}
