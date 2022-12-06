import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export default async function () {
  const world = await d3.json("data/countries-50m.json");
  const domain = feature(
    world,
    world.objects.countries.geometries.find((d) => d.properties.name === "Antarctica")
  );
  return Plot.plot({
    width: 600,
    height: 600,
    inset: 30,
    style: "overflow: visible;",
    projection: {
      type: "azimuthal-equidistant",
      rotate: [0, 90],
      domain
    },
    marks: [
      Plot.graticule(),
      Plot.geo(domain, {fill: "currentColor"}),
      Plot.frame(),
      // Since we’re using the default clip: "frame" for the projection, these
      // marks should not be rendered; the projected point is outside the frame.
      Plot.dot({length: 1}, {x: -90, y: -63}),
      Plot.text({length: 1}, {x: -90, y: -63, text: ["Do not render"]})
    ]
  });
}
