import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

function tipped(mark, options = {}) {
  return Plot.marks(mark, Plot.tip(mark.data, Plot.pointer(anchor(mark, options))));
}

function anchor(mark, options = {}) {
  return Plot.initializer({...options, x: null, y: null}, (data, facets, channels, scales, dimensions, context) => {
    const xy = {};
    const state = (context as any).getMarkState(mark);
    for (const k of ["fx", "fy", "x", "x1", "x2", "y", "y1", "y2"]) if (state.channels[k]) xy[k] = state.channels[k];
    return {data: state.data, facets: state.facets, channels: xy};
  });
}

export async function tipBar() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 100,
    marks: [tipped(Plot.barX(olympians, Plot.groupY({x: "count"}, {y: "sport", sort: {y: "x"}})))]
  });
}

export async function tipBin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"})),
      Plot.tip(olympians, Plot.pointerX(Plot.binX({y: "count"}, {x: "weight"})))
    ]
  });
}

export async function tipBinStack() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectY(olympians, Plot.stackY({}, Plot.binX({y: "count"}, {x: "weight", fill: "sex"}))),
      Plot.tip(olympians, Plot.pointerX(Plot.stackY({}, Plot.binX({y: "count"}, {x: "weight", stroke: "sex"}))))
    ]
  });
}

export async function tipCell() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marginLeft: 100,
    color: {scheme: "blues"},
    marks: [
      Plot.cell(olympians, Plot.group({fill: "count"}, {x: "sex", y: "sport"})),
      Plot.tip(olympians, Plot.pointerY(Plot.group({stroke: "count"}, {x: "sex", y: "sport"})))
    ]
  });
}

export async function tipCellFacet() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marginLeft: 100,
    color: {scheme: "blues"},
    marks: [
      Plot.cell(olympians, Plot.groupY({fill: "count"}, {fx: "sex", y: "sport"})),
      Plot.tip(olympians, Plot.pointerY(Plot.groupY({stroke: "count"}, {fx: "sex", y: "sport"})))
    ]
  });
}

export async function tipDodge() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 160,
    marks: [
      Plot.dot(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"})),
      Plot.tip(penguins, Plot.pointer(Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g"})))
    ]
  });
}

export async function tipDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
      Plot.tip(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm"}))
    ]
  });
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
      Plot.dot(athletes, {x: "weight", y: "height", fx: "sex", fy: "date_of_birth"}),
      Plot.tip(
        athletes,
        Plot.pointer({
          x: "weight",
          y: "height",
          fx: "sex",
          fy: "date_of_birth",
          channels: {
            name: {value: "name"},
            sport: {value: "sport"}
          }
        })
      )
    ]
  });
}

export async function tipHexbin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.hexagon(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"})),
      Plot.tip(olympians, Plot.pointer(Plot.hexbin({r: "count"}, {x: "weight", y: "height"})))
    ]
  });
}

export async function tipLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.lineY(aapl, {x: "Date", y: "Close"}), Plot.tip(aapl, Plot.pointerX({x: "Date", y: "Close"}))]
  });
}

export async function tipRaster() {
  const ca55 = await d3.csv<any>("data/ca55-south.csv", d3.autoType);
  const domain = {type: "MultiPoint", coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])} as const;
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {type: "reflect-y", inset: 3, domain},
    color: {type: "diverging"},
    marks: [
      tipped(Plot.raster(ca55, {x: "GRID_EAST", y: "GRID_NORTH", fill: "MAG_IGRF90", interpolate: "random-walk"}))
    ]
  });
}

export async function tipRule() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.ruleX(penguins, {x: "body_mass_g"}), Plot.tip(penguins, Plot.pointerX({x: "body_mass_g"}))]
  });
}
