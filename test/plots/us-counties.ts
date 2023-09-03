import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

export async function usCounties() {
  const [nation, statemesh, counties] = await d3
    .json<any>("data/us-counties-10m.json")
    .then((us) => [feature(us, us.objects.nation), mesh(us, us.objects.states), feature(us, us.objects.counties)]);
  return Plot.plot({
    width: 975,
    height: 610,
    projection: "albers-usa",
    marks: [
      Plot.geo(nation, {fill: "#dedede"}),
      Plot.geo(statemesh, {stroke: "#fff"}),
      Plot.dot(counties.features, Plot.centroid())
    ]
  });
}

// Tests an explicit null scale override for geometries, when the projection is set at the top-level.
export async function usCountiesPreprojected() {
  const [nation, statemesh, counties] = await d3
    .json<any>("data/counties-albers-10m.json")
    .then((us) => [feature(us, us.objects.nation), mesh(us, us.objects.states), feature(us, us.objects.counties)]);
  return Plot.plot({
    width: 975,
    height: 610,
    projection: "albers-usa",
    marks: [
      Plot.geo(nation, {fill: "#dedede", geometry: {value: Plot.identity, scale: null}}),
      Plot.geo(statemesh, {stroke: "#fff", geometry: {value: Plot.identity, scale: null}}),
      Plot.dot(counties.features, Plot.centroid({geometry: {value: Plot.identity, scale: null}}))
    ]
  });
}
