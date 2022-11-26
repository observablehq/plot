import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const [capitals, nationmesh] = await Promise.all([
    d3.csv("data/us-state-capitals.csv", d3.autoType),
    d3.json("data/us-counties-10m.json").then((us) => feature(us, us.objects.nation))
  ]);
  return Plot.plot({
    width: 600,
    height: 600,
    projection: ({width, height}) =>
      d3
        .geoAzimuthalEqualArea()
        .rotate([96, -40])
        .clipAngle(23)
        .fitExtent(
          [
            [2, 2],
            [width - 2, height - 2]
          ],
          {type: "Sphere"}
        ),
    color: {
      scheme: "blues"
    },
    marks: [
      Plot.dot(capitals, {x: "longitude", y: "latitude", r: 1, fill: "currentColor"}),
      Plot.voronoi(capitals, {
        x: "longitude",
        y: "latitude",
        clip: "sphere",
        title: "state",
        fill: "white",
        fillOpacity: 0.01,
        stroke: "black",
        strokeOpacity: 0.2
      }),
      Plot.geometry(nationmesh, {strokeOpacity: 0.3}),
      Plot.geometry({type: "Sphere"}, {strokeWidth: 2})
    ]
  });
}
