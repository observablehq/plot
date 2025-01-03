import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

type Prj = {type: Plot.ProjectionName | (() => any); parallels?: [number, number]; rotate?: [number, number]};

async function stateMap(id: string, prj: Prj) {
  const us = await d3.json<any>("data/us-counties-10m.json");
  const state = feature(us, us.objects.states).features.find((d) => d.id === id);
  const counties = mesh(
    us,
    {type: "GeometryCollection", geometries: us.objects.counties.geometries.filter((d) => d.id.startsWith(id))},
    (a, b) => a != b
  );
  return Plot.plot({
    projection: {...prj, domain: state},
    marks: [Plot.geo(counties, {strokeOpacity: 0.2}), Plot.geo(state)]
  });
}

export async function projectionDomainRatioME() {
  return stateMap("23", {type: "transverse-mercator", rotate: [68 + 30 / 60, -43 - 40 / 60]});
}

export async function projectionDomainRatioMN() {
  return stateMap("27", {type: "conic-conformal", parallels: [45 + 37 / 60, 47 + 3 / 60], rotate: [94 + 15 / 60, 0]});
}

export async function projectionDomainRatioNC() {
  return stateMap("37", {type: "conic-conformal", parallels: [34 + 20 / 60, 36 + 10 / 60], rotate: [79, 0]});
}

export async function projectionDomainRatioNCManual() {
  return stateMap("37", {
    type: () =>
      d3
        .geoConicConformal()
        .parallels([34 + 20 / 60, 36 + 10 / 60])
        .rotate([79, 0])
  });
}
