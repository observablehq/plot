import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function occlusionXPaths() {
  const random = d3.randomNormal.source(d3.randomLcg(42))(5, 2);
  const data = [];
  const points = [];
  for (let i = 0; i < 101; ++i) {
    data.push(random());
    points.push(...data.map((d, e) => ({x: d, y: i, e})));
  }
  return Plot.plot({
    x: {domain: [0, 10]},
    marks: [
      Plot.line(points, Plot.occlusionX(6, {x: "x", z: "e", y: "y", strokeOpacity: 0.3, strokeWidth: 0.5})),
      Plot.dot(
        points,
        Plot.occlusionX(
          {minDistance: 6},
          {x: "x", r: 2, fill: "currentColor", fillOpacity: (d) => (d.y === d.e ? 1 : 0), y: "y"}
        )
      )
    ]
  });
}

export async function occlusionYPaths() {
  const random = d3.randomLcg(42);
  const data = [];
  const points = [];
  let i;
  for (i = 0; i < 31; ++i) {
    data.push(random());
    points.push(...data.map((d, e) => ({x: i, y: d, e})));
  }
  points.push(...data.map((d, e) => ({x: i, y: d, e})));
  return Plot.plot({
    axis: null,
    y: {inset: 25},
    color: {scheme: "Observable10"},
    marks: [
      Plot.line(points, Plot.occlusionY({x: "x", stroke: "e", y: "y", curve: "basis", strokeWidth: 1})),
      Plot.dot(points, Plot.occlusionY({x: "x", fill: "e", r: (d) => d.x === d.e, y: "y"}))
    ]
  });
}

async function loadSymbol(name) {
  const Symbol = name.toUpperCase();
  return d3.csv(`data/${name}.csv`, (d) => ({Symbol, ...d3.autoType(d)}));
}

export async function occlusionStocks() {
  const stocks = (await Promise.all(["aapl", "amzn", "goog", "ibm"].map(loadSymbol))).flat();
  return Plot.plot({
    insetTop: 4,
    insetRight: 15,
    y: {axis: null},
    color: {legend: true},
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(stocks, {x: "Date", y: "Close", stroke: "Symbol"}),
      Plot.text(
        stocks,
        Plot.occlusionY(
          Plot.binX(
            {
              x: "first",
              y: "first",
              text: "first",
              thresholds: "3 months"
            },
            {
              filter: (
                (k) => (d) =>
                  d.Date > k
              )(new Date("2013-07-01")),
              x: "Date",
              y: "Close",
              text: (d) => Math.round(d.Close),
              fill: "black",
              stroke: "white",
              z: "Symbol"
            }
          )
        )
      ),
      Plot.text(
        stocks,
        Plot.occlusionY(
          Plot.selectMaxX({
            dx: 4,
            textAnchor: "start",
            x: "Date",
            y: "Close",
            text: "Symbol",
            fill: "black",
            stroke: "white",
            z: "Symbol"
          })
        )
      )
    ]
  });
}

export async function occlusionCancer() {
  const cancer = await d3.csv<any>("data/cancer.csv", d3.autoType);
  return Plot.plot({
    width: 460,
    height: 600,
    marginRight: 120,
    marginBottom: 20,
    x: {
      axis: "top",
      domain: ["5 Year", "10 Year", "15 Year", "20 Year"],
      label: null,
      padding: 0
    },
    y: {axis: null, insetTop: 20},
    marks: [
      Plot.line(cancer, {x: "year", y: "survival", z: "name", strokeWidth: 1}),
      Plot.text(
        cancer,
        Plot.occlusionY(
          Plot.group(
            {
              text: "first"
            },
            {
              text: "survival",
              x: "year",
              y: "survival",
              textAnchor: "end",
              dx: 5,
              fontVariant: "tabular-nums",
              stroke: "var(--plot-background)",
              strokeWidth: 7,
              fill: "currentColor",
              tip: true
            }
          )
        )
      ),
      Plot.text(
        cancer,
        Plot.occlusionY({
          filter: (d) => d.year === "20 Year",
          text: "name",
          textAnchor: "start",
          frameAnchor: "right",
          dx: 10,
          y: "survival"
        })
      )
    ],
    caption: "Estimates of survival rate (%), per type of cancer"
  });
}
