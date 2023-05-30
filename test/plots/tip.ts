import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

export async function tipAreaStack() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.areaY(industries, {x: "date", y: "unemployed", fill: "industry", tip: true}).plot({marginLeft: 50});
}

export async function tipBar() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 100,
    marks: [Plot.barX(olympians, Plot.groupY({x: "count"}, {y: "sport", sort: {y: "x"}, tip: true}))]
  });
}

export async function tipBin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", tip: true})).plot();
}

export async function tipBinStack() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex", tip: true})).plot();
}

export async function tipCell() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marginLeft: 100,
    color: {scheme: "blues"},
    marks: [Plot.cell(olympians, Plot.group({fill: "count"}, {x: "sex", y: "sport", tip: "y"}))]
  });
}

export async function tipCellFacet() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marginLeft: 100,
    color: {scheme: "blues"},
    marks: [Plot.cell(olympians, Plot.groupY({fill: "count"}, {fx: "sex", y: "sport", tip: "y"}))]
  });
}

export async function tipDodge() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.dot(penguins, Plot.dodgeY({x: "culmen_length_mm", r: "body_mass_g", tip: true})).plot({height: 160});
}

export async function tipDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex", tip: true}).plot();
}

export async function tipDotX() {
  return Plot.dotX(d3.range(10), {tip: true}).plot();
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
      Plot.dot(athletes, {
        x: "weight",
        y: "height",
        fx: "sex",
        fy: "date_of_birth",
        stroke: "#aaa",
        filter: (d) => !d.info
      }),
      Plot.dot(athletes, {
        x: "weight",
        y: "height",
        fx: "sex",
        fy: "date_of_birth",
        filter: (d) => d.info,
        title: (d) => [d.name, d.info].join("\n"),
        tip: true
      })
    ]
  });
}

export async function tipDotFilter() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"};
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {...xy, filter: (d) => d.sex === "MALE", tip: true}),
      Plot.dot(penguins, {...xy, filter: (d) => d.sex === "FEMALE", tip: true})
    ]
  });
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

export async function tipGroupPrimitives() {
  return Plot.plot({
    height: 80,
    x: {type: "band"},
    marks: [Plot.barY("de156a2fc8", Plot.groupX({y: "count"}, {x: (d) => d, tip: true}))]
  });
}

export async function tipHexbin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.hexagon(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height", tip: true})).plot();
}

// Normally you would slap a tip: true on the hexagon, as above, but here we
// want to test that the hexbin transform isn’t applying an erroneous stroke:
// none to the tip options (which would change the tip appearance).
export async function tipHexbinExplicit() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.hexagon(olympians, Plot.hexbin({fill: "count"}, {x: "weight", y: "height"})),
      Plot.tip(olympians, Plot.pointer(Plot.hexbin({fill: "count"}, {x: "weight", y: "height"})))
    ]
  });
}

export async function tipLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.lineY(aapl, {x: "Date", y: "Close", tip: true}).plot();
}

export async function tipNewLines() {
  return Plot.plot({
    height: 40,
    style: "overflow: visible;",
    x: {axis: "top", label: null},
    marks: [
      Plot.tip(
        [
          {x: "after", label: `Hello\n\n`},
          {x: "before", label: `\n\nWorld`},
          {x: "between", label: `{\n\n}`}
        ],
        {
          x: "x",
          anchor: "top",
          title: "label"
        }
      ),
      Plot.tip([{x: "no name"}], {
        x: "x",
        channels: {a: ["first"], b: ["second"], "": [""]}
      })
    ]
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
    marks: [Plot.raster(ca55, {x: "GRID_EAST", y: "GRID_NORTH", fill: "MAG_IGRF90", interpolate: "nearest", tip: true})]
  });
}

export async function tipRule() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.ruleX(penguins, {x: "body_mass_g", tip: true}).plot();
}

export async function tipRuleAnchored() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    x: {insetLeft: 110},
    marks: [
      Plot.ruleX(penguins, {x: "body_mass_g"}),
      Plot.tip(penguins, Plot.pointer({px: "body_mass_g", frameAnchor: "left", anchor: "middle", dx: 42}))
    ]
  });
}

export async function tipTransform() {
  return Plot.plot({
    width: 245,
    color: {percent: true, legend: true},
    marks: [Plot.dotX([0, 0.1, 0.3, 1], {fill: Plot.identity, r: 10, frameAnchor: "middle", tip: true})]
  });
}
