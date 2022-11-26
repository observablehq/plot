import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoArmadillo} from "d3-geo-projection";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const land = feature(world, world.objects.land);
  return Plot.plot({
    width: 960,
    height: 548,
    margin: 1,
    projection: armadillo,
    marks: [
      Plot.geo(land, {clip: "sphere", fill: "currentColor"}),
      Plot.graticule({clip: "sphere", strokeOpacity: 0.2}),
      Plot.sphere()
    ]
  });
}

function armadillo({width, height, marginTop, marginRight, marginBottom, marginLeft}) {
  return geoArmadillo()
    .precision(0.2)
    .fitExtent(
      [
        [marginLeft, marginTop],
        [width - marginRight, height - marginBottom]
      ],
      {type: "Sphere"}
    );
}
