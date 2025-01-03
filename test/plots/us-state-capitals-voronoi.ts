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
      Plot.voronoiMesh(capitals, {x: "longitude", y: "latitude", clip: "sphere"}),
      Plot.voronoi(
        capitals,
        Plot.pointer({
          x: "longitude",
          y: "latitude",
          clip: "sphere",
          title: "state",
          stroke: "red",
          fill: "red",
          fillOpacity: 0.4,
          pointerEvents: "all",
          maxRadius: Infinity
        })
      ),
      Plot.sphere({strokeWidth: 2})
    ]
  });
}

async function voronoiMap(centroid, clipNation = false) {
  const [nation, states] = await d3
    .json<any>("data/us-counties-10m.json")
    .then((us) => [feature(us, us.objects.nation), feature(us, us.objects.states)]);

  const clip = clipNation ? nation : "sphere";
  return Plot.plot({
    width: 640,
    height: 640,
    margin: 1,
    projection: ({width, height}) =>
      d3
        .geoAzimuthalEqualArea()
        .rotate([96, -40])
        .clipAngle(24)
        .fitSize([width, height], clipNation ? nation : {type: "Sphere"}),
    marks: [
      Plot.geo(nation, {fill: "currentColor", fillOpacity: 0.2}),
      Plot.dot(states.features, centroid({r: 2.5, fill: "currentColor"})),
      Plot.voronoiMesh(states.features, centroid({clip})),
      Plot.voronoi(
        states.features,
        Plot.pointer(
          centroid({
            x: "longitude",
            y: "latitude",
            title: "state",
            stroke: "red",
            fill: "red",
            fillOpacity: 0.4,
            pointerEvents: "all",
            maxRadius: Infinity,
            clip
          })
        )
      ),
      clipNation ? Plot.geo(nation, {strokeWidth: 1}) : Plot.sphere({strokeWidth: 2})
    ]
  });
}

export async function usStateCentroidVoronoi() {
  return voronoiMap(Plot.centroid);
}

export async function usStateClipVoronoi() {
  return voronoiMap(Plot.centroid, true);
}

export async function usStateGeoCentroidVoronoi() {
  return voronoiMap(Plot.geoCentroid);
}
