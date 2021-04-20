import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {default as topo} from "world-atlas/countries-110m.json";

export default async function() {  
  const world = topojson.feature(topo, topo.objects.countries);
  return Plot.plot({
    projection: {
      projection: "equalEarth",
      rotate: [-10, 0]
    },
    color: { scheme: "rdylgn" },
    marks: [
      Plot.carto([{type: "Sphere"}], { fill: "lightblue" }),
      Plot.carto([d3.geoGraticule10()], { stroke: "#fff", strokeWidth: .25 }),
      Plot.carto(world.features,
        {
          fill: d => d3.geoCentroid(d)[1],
          strokeWidth: .25,
          stroke: "#000"
        }),
      Plot.carto([{type: "Sphere"}], { strokeWidth: 2 })
    ],
    width: document.body.offsetWidth,
    height: document.body.offsetWidth / 2
  });
}
