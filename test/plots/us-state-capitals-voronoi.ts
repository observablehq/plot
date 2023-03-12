import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function usStateCapitalsVoronoi() {
  const [capitals, nation] = await Promise.all([
    d3.csv<any>("data/us-state-capitals.csv", d3.autoType),
    d3.json<any>("data/us-counties-10m.json").then((us) => feature(us, us.objects.nation))
  ]);
  return Plot.plot({
    width: 640,
    height: 640,
    margin: 1,
    projection: ({width, height}) =>
      d3.geoAzimuthalEqualArea().rotate([96, -40]).clipAngle(24).fitSize([width, height], {type: "Sphere"}),
    marks: [
      Plot.geo(nation, {fill: "currentColor", fillOpacity: 0.2}),
      Plot.dot(capitals, {x: "longitude", y: "latitude", r: 2.5, fill: "currentColor"}),
      Plot.voronoi(capitals, {x: "longitude", y: "latitude", clip: "sphere", title: "state", pointerEvents: "all"}),
      Plot.sphere({strokeWidth: 2})
    ]
  });
}
