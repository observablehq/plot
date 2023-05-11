import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

function tipped(mark, options = {}, pointer = Plot.pointer) {
  return Plot.marks(mark, Plot.tip(mark.data, pointer(derive(mark, options))));
}

function tippedX(mark, options = {}) {
  return tipped(mark, options, Plot.pointerX);
}

function tippedY(mark, options = {}) {
  return tipped(mark, options, Plot.pointerY);
}

function derive(mark, options = {}) {
  return Plot.initializer({...options, x: null, y: null}, (data, facets, channels, scales, dimensions, context) => {
    return (context as any).getMarkState(mark);
  });
}

export async function tipBar() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return tippedY(Plot.barX(olympians, Plot.groupY({x: "count"}, {y: "sport", sort: {y: "x"}}))).plot({marginLeft: 100});
}

export async function tipBin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return tippedX(Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"}))).plot();
}

export async function tipBinStack() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return tippedX(Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex"}))).plot();
}

export async function tipCell() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marginLeft: 100,
    color: {scheme: "blues"},
    marks: [tippedY(Plot.cell(olympians, Plot.group({fill: "count"}, {x: "sex", y: "sport"})))]
  });
}

export async function tipCellFacet() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marginLeft: 100,
    color: {scheme: "blues"},
    marks: [tippedY(Plot.cell(olympians, Plot.groupY({fill: "count"}, {fx: "sex", y: "sport"})))]
  });
}

export async function tipDodge() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return tipped(Plot.dot(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"}))).plot({height: 160});
}

export async function tipDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return tipped(Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"})).plot();
}

export async function tipDotFacets() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    fy: {
      label: "decade of birth",
      interval: "10 years"
    },
    marks: [
      tipped(
        Plot.dot(athletes, {
          x: "weight",
          y: "height",
          fx: "sex",
          fy: "date_of_birth",
          channels: {name: "name", sport: "sport"}
        })
      )
    ]
  });
}

export async function tipDotFilter() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"};
  const [dot1, tip1] = tipped(Plot.dot(penguins, {...xy, filter: (d) => d.sex === "MALE"}), {anchor: "left"});
  const [dot2, tip2] = tipped(Plot.dot(penguins, {...xy, filter: (d) => d.sex === "FEMALE"}), {anchor: "right"});
  return Plot.marks(dot1, dot2, tip1, tip2).plot();
}

export async function tipGeoCentroid() {
  const [[counties, countymesh]] = await Promise.all([
    d3
      .json<any>("data/us-counties-10m.json")
      .then((us) => [feature(us, us.objects.counties), mesh(us, us.objects.counties)])
  ]);
  // Alternatively, using centroid (slower):
  // const pointer = Plot.pointer(Plot.centroid());
  const {x, y} = Plot.geoCentroid();
  const pointer = Plot.pointer({px: x, py: y, x, y});
  return Plot.plot({
    width: 960,
    height: 600,
    projection: "albers-usa",
    marks: [
      Plot.geo(countymesh),
      Plot.geo(counties, {...pointer, stroke: "red", strokeWidth: 2}),
      Plot.tip(counties.features, {...pointer, channels: {name: (d) => d.properties.name}})
    ]
  });
}

export async function tipHexbin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return tipped(Plot.hexagon(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"}))).plot();
}

export async function tipLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return tippedX(Plot.lineY(aapl, {x: "Date", y: "Close"})).plot();
}

export async function tipRaster() {
  const ca55 = await d3.csv<any>("data/ca55-south.csv", d3.autoType);
  const domain = {type: "MultiPoint", coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])} as const;
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {type: "reflect-y", inset: 3, domain},
    color: {type: "diverging"},
    marks: [tipped(Plot.raster(ca55, {x: "GRID_EAST", y: "GRID_NORTH", fill: "MAG_IGRF90", interpolate: "nearest"}))]
  });
}

export async function tipRule() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return tippedX(Plot.ruleX(penguins, {x: "body_mass_g"})).plot();
}
