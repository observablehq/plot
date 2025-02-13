import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature} from "topojson-client";

export async function projectionClipAngle() {
  const world = await d3.json<any>("data/countries-50m.json");
  const domain = feature(world, world.objects.land);
  const svg = Plot.plot({
    width: 600,
    height: 600,
    projection: {type: "azimuthal-equidistant", clip: 30, rotate: [0, 90], domain: {type: "Sphere"}},
    marks: [Plot.graticule(), Plot.geo(domain, {fill: "currentColor"}), Plot.sphere()]
  });
  cleanPaths(svg);
  return svg;
}

// Due to numerical instabilities, paths are inconsistent across architectures.
// This removes some invisible paths to get this test to pass consistently.
function cleanPaths(svg: SVGSVGElement | HTMLElement) {
  for (const path of svg.querySelectorAll("[fill=none] path")) {
    const d = path.getAttribute("d");
    path.setAttribute("d", d.replace(/M\d+(?:\.\d+)?,\d+(?:\.\d+)?L\d+(?:\.\d+)?,\d+(?:\.\d+)?(?=M)/g, ""));
  }
}
