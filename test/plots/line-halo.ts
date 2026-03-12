import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function lineHalo() {
  const gdp = await d3.csv<any>("data/us-gdp.csv", d3.autoType);
  const recession = ["1980-04-01", "1990-10-01", "2001-04-01", "2008-01-01", "2020-01-01"].map(d3.isoParse);
  const quarters = 16;
  const fredSeries = recession.flatMap((start) => {
    const min = d3.utcMonth.offset(start!, -3);
    const max = d3.utcMonth.offset(start!, quarters * 3);
    return gdp
      .filter((d: any) => d.date >= min && d.date < max)
      .map((d: any) => ({
        ...d,
        start,
        quarters: d3.utcMonth.every(3)!.range(d3.utcMonth.offset(start!, -3), d.date).length
      }));
  });
  return Plot.plot({
    width: 600,
    height: 350,
    marginRight: 30,
    x: {
      insetLeft: 20,
      insetRight: 0,
      ticks: quarters,
      tickFormat: (d) => (d === 0 ? "" : d % 4 ? "" : `${d}`),
      label: null,
      line: true
    },
    y: {
      type: "log",
      grid: true,
      tickSize: 0,
      tickFormat: (d1) => (d1 === 1 ? "0" : d3.format("+")(Math.round(100 * (d1 - 1)))),
      label: "\u2191 cumulative change in GDP from the start of the last 5 recessions (%)",
      insetTop: -10,
      insetBottom: 15
    },
    color: {range: d3.schemeBlues[6].slice(-4).concat("red")},
    marks: [
      Plot.ruleY([1], {strokeWidth: 0.5}),
      Plot.ruleX([0, 9], {strokeDasharray: "2,4"}),
      Plot.text([0, 9], {
        x: [0, 9],
        y: [1 + 7 / 100, 1 - 7 / 100],
        textAnchor: "start",
        text: ["\u2190 Final quarter before recession", "\u2190 9 quarters into recession"],
        dx: 4
      }),
      Plot.line(
        fredSeries,
        Plot.normalizeY({
          x: "quarters",
          y: "gdpc1",
          stroke: "start",
          halo: true
        })
      ),
      Plot.text(
        fredSeries,
        Plot.selectMaxX(
          Plot.normalizeY({
            x: "quarters",
            y: "gdpc1",
            z: "start",
            textAnchor: "start",
            dx: 5,
            text: (d: any) => String(d.start.getUTCFullYear()),
            fill: (d: any) => String(d.start.getUTCFullYear())
          })
        )
      )
    ]
  });
}

export async function lineHaloStyles() {
  const gdp = await d3.csv<any>("data/us-gdp.csv", d3.autoType);
  const recession = ["1980-04-01", "1990-10-01", "2001-04-01", "2008-01-01", "2020-01-01"].map(d3.isoParse);
  const quarters = 16;
  const fredSeries = recession.flatMap((start) => {
    const min = d3.utcMonth.offset(start!, -3);
    const max = d3.utcMonth.offset(start!, quarters * 3);
    return gdp
      .filter((d: any) => d.date >= min && d.date < max)
      .map((d: any) => ({
        ...d,
        start,
        quarters: d3.utcMonth.every(3)!.range(d3.utcMonth.offset(start!, -3), d.date).length
      }));
  });
  return Plot.plot({
    width: 600,
    height: 350,
    marks: [
      Plot.line(fredSeries, Plot.normalizeY({x: "quarters", y: "gdpc1", stroke: "start", halo: "lightblue"})),
      Plot.line(fredSeries, Plot.normalizeY({x: "quarters", y: "gdpc1", stroke: "start", halo: 7})),
      Plot.line(
        fredSeries,
        Plot.normalizeY({x: "quarters", y: "gdpc1", stroke: "start", haloColor: "pink", haloRadius: 1})
      )
    ],
    color: {range: d3.schemeBlues[6].slice(-4).concat("red")}
  });
}
