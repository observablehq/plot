import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function tooltipBin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"})),
      Plot.tooltip(olympians, Plot.binX({y: "count"}, {x: "weight", axis: "x"}))
    ]
  });
}

export async function tooltipBinStack() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex"})),
      Plot.tooltip(olympians, Plot.stackY({}, Plot.binX({y: "count"}, {x: "weight", z: "sex", axis: "x"})))
    ]
  });
}

export async function tooltipDotColor() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
      Plot.tooltip(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"})
    ]
  });
}

export async function tooltipDotDodge() {
  const parseDate = d3.utcParse("%d-%b-%y");
  const parseAssets = (x) => parseFloat(x.replace(/[^\d.]/g, ""));
  const fails = d3
    .csvParseRows(await d3.text("data/bfd.csv"))
    .slice(1, -2)
    .map((d) => ({
      "Bank Name": d[0].split(", ")[0],
      "City, State": d[0].split(", ").slice(1).join(", "),
      Date: parseDate(d[2]),
      Assets: parseAssets(d[3]),
      Acquirer: d[5]
    }));
  return Plot.plot({
    width: 1152,
    height: 680,
    insetLeft: 10,
    insetRight: 60,
    r: {range: [0, 80]},
    marks: [
      Plot.frame({anchor: "bottom"}),
      Plot.dot(
        fails,
        Plot.dodgeY({
          padding: 2,
          x: "Date",
          r: "Assets",
          fill: "#ddd",
          stroke: "#000",
          strokeWidth: 1
        })
      ),
      Plot.text(
        fails,
        Plot.filter(
          (d) => d.Assets > 2000,
          Plot.dodgeY({
            padding: 2,
            x: "Date",
            r: "Assets",
            lineWidth: 5,
            text: (d) =>
              d.Assets > 12900
                ? `${d["Bank Name"]}\n${(d["Assets"] / 1000).toFixed(0)}B`
                : `${(d["Assets"] / 1000).toFixed(1)}`,
            fill: "#000",
            stroke: "#ddd"
          })
        )
      ),
      Plot.tooltip(
        fails,
        Plot.dodgeY({
          padding: 2,
          x: "Date",
          r: "Assets",
          channels: {Name: {value: "Bank Name"}}
        })
      )
    ]
  });
}

export async function tooltipDotFacets() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    fy: {
      label: "decade of birth",
      interval: "10 years"
    },
    marks: [
      Plot.dot(athletes, {x: "weight", y: "height", fx: "sex", fy: "date_of_birth"}),
      Plot.tooltip(athletes, {
        x: "weight",
        y: "height",
        fx: "sex",
        fy: "date_of_birth",
        channels: {
          name: {value: "name"},
          sport: {value: "sport"}
        }
      })
    ]
  });
}

export async function tooltipLineColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.lineY(aapl, {x: "Date", y: "Close", stroke: "Volume", z: null}),
      Plot.tooltip(aapl, {x: "Date", y: "Close", stroke: "Volume", axis: "x"})
    ]
  });
}

export async function tooltipMultiLine() {
  const bls = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.lineY(bls, {x: "date", y: "unemployment", z: "division"}),
      Plot.ruleY([0]),
      Plot.tooltip(bls, {x: "date", y: "unemployment", channels: {division: {value: "division"}}, axis: "x"})
    ]
  });
}

export async function tooltipRule() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    style: "overflow: visible;",
    marks: [Plot.ruleX(penguins, {x: "body_mass_g"}), Plot.tooltip(penguins, {x: "body_mass_g", corner: "bottom-left"})]
  });
}
