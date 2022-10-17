import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const gdp = await d3.csv("data/us-gdp.csv", d3.autoType);
  const recession = ["1980-04-01", "1990-10-01", "2001-04-01", "2008-01-01", "2020-01-01"].map(d3.isoParse);
  const quarters = 16;
  const fredSeries = recession.flatMap((start) => {
    const min = d3.utcMonth.offset(start, -3);
    const max = d3.utcMonth.offset(start, quarters * 3);
    return gdp
      .filter((d) => d.date >= min && d.date < max)
      .map((d) => ({...d, start, quarters: d3.utcMonth.every(3).range(d3.utcMonth.offset(start, -3), d.date).length}));
  });
  const random = d3.randomLcg(42);
  return Plot.plot({
    height: 350,
    width: 600,
    marginRight: 30,
    marks: [
      Plot.ruleY([1], {strokeWidth: 0.5}),
      Plot.ruleX([0, 9], {strokeDasharray: [2, 4]}),
      Plot.text([0, 9], {
        x: [0, 9],
        y: [1 + 7 / 100, 1 - 7 / 100],
        textAnchor: "start",
        text: ["← Final quarter before recession", "← 9 quarters into recession"],
        dx: 4
      }),
      Plot.line(
        fredSeries,
        Plot.normalizeY({
          filter: (d) => d.start === recession[0],
          x: "quarters",
          y: "gdpc1",
          stroke: "start",
          halo: "lightblue"
        })
      ),
      Plot.line(
        fredSeries,
        Plot.normalizeY({
          filter: (d) => d.start === recession[1],
          x: "quarters",
          y: "gdpc1",
          stroke: "start",
          halo: true
        })
      ),
      Plot.line(
        fredSeries,
        Plot.normalizeY({
          filter: (d) => d.start === recession[2],
          x: "quarters",
          y: "gdpc1",
          stroke: "start",
          strokeWidth: () => 3 + 2 * random(),
          halo: true
        })
      ),
      Plot.line(
        fredSeries,
        Plot.normalizeY({
          filter: (d) => d.start === recession[3],
          x: "quarters",
          y: "gdpc1",
          stroke: "start",
          halo: 7
        })
      ),
      Plot.line(
        fredSeries,
        Plot.normalizeY({
          filter: (d) => d.start === recession[4],
          x: "quarters",
          y: "gdpc1",
          stroke: "start",
          strokeDasharray: "2% 1.5%",
          haloColor: "pink",
          haloRadius: 1
        })
      )
    ],
    x: {
      insetLeft: 20,
      insetRight: 0,
      ticks: quarters,
      tickFormat: (d) => (d === 0 ? "" : d % 4 ? "" : d),
      label: null,
      line: true
    },
    y: {
      type: "log",
      grid: true,
      tickSize: 0,
      tickFormat: (d1) => (d1 === 1 ? "0" : d3.format("+")(Math.round(100 * (d1 - 1)))),
      label: "↑ cumulative change in GDP from the start of the last 5 recessions (%)",
      insetTop: -10,
      insetBottom: 15
    },
    color: {range: d3.schemeBlues[6].slice(-4).concat("red")}
  });
}
