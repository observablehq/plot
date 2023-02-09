import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {geoChamberlinAfrica} from "d3-geo-projection";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-110m.json");
  const land = feature(world, world.objects.land);
  const countries = feature(world, world.objects.countries).features;
  return Plot.plot({
    width: 600,
    height: 600,
    projection: {
      type: geoChamberlinAfrica,
      domain: {
        type: "MultiPoint",
        coordinates: [
          [-20, 0],
          [55, 0]
        ]
      }
    },
    marks: [
      Plot.geo(land),
      Plot.rect(countries, {
        transform: (data, facets) => ({
          data: data.map((c) => d3.geoBounds(c).flat()), // returns [x1, y1, x2, y2]
          facets
        }),
        x1: "0",
        y1: "1",
        x2: "2",
        y2: "3",
        stroke: "green"
      }),
      Plot.arrow([1], {x1: -10, y1: 10, x2: 20, y2: -32, bend: true, stroke: "red"}),
      Plot.sphere()
    ]
  });
}
