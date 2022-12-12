import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const land = feature(world, world.objects.land);

  const cities = await d3.csv("data/cities10000.csv", d3.autoType);
  return Plot.plot({
    style: {overflow: "visible"},
    projection: {type: "equirectangular", rotate: [-10, 0]},
    r: {zero: true, range: [0.5, 6.5]},
    color: {scheme: "turbo"},
    marks: [
      Plot.geo(land, {fill: "#f0f0f0"}),
      Plot.dot(
        d3.sort(cities, (d) => -d.population).slice(0, 5000),
        Plot.dodgeY({
          x: "longitude",
          y: "latitude",
          r: "population",
          padding: 0,
          sort: "population",
          reverse: true,
          fill: "country",
          title: (d) => `${d.name} (${d.country})`,
          stroke: "white",
          strokeWidth: 0.25,
          anchor: "middle"
        })
      ),
      Plot.graticule(),
      Plot.sphere()
    ]
  });
}
