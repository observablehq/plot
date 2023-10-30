import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function youngAdults() {
  const ilc_lvps08 = await d3.csv<any>("data/ilc_lvps08.csv", d3.autoType);
  const ages = ["Y16-19", "Y20-24", "Y25-29"];
  const geos = ["SE", "FR", "DE", "TR", "IT"];
  const wider = d3
    .flatRollup(
      ilc_lvps08.filter(({age, geo}) => ages.includes(age) && geos.includes(geo)),
      (v) =>
        Object.fromEntries(
          d3
            .index(
              v.map(({sex, OBS_VALUE}) => [sex, OBS_VALUE]),
              (d) => d[0]
            )
            .values()
        ),
      (d) => d.geo,
      (d) => d.age,
      (d) => d.TIME_PERIOD
    )
    .map(([geo, age, year, d]) => ({geo, age, year, ...d}));
  return Plot.plot({
    title: "Share of young adults living with their parents (%)",
    subtitle: "…by age and sex. Data: Eurostat",
    width: 928,
    color: {legend: true},
    style: `max-width:${4000}px; overflow-y: visible;`,
    x: {ticks: 4, tickFormat: "d"},
    y: {grid: true, nice: true},
    marks: [
      Plot.frame(),
      Plot.differenceY(wider, {
        x: "year",
        y1: "M",
        y2: "T",
        fillOpacity: 0.5,
        negativeFill: "age",
        positiveFill: "grey",
        stroke: "none",
        fx: "geo",
        z: (d) => `${d.age}, ${d.geo}`,
        curve: "basis"
      }),
      Plot.differenceY(wider, {
        x: "year",
        y1: "F",
        y2: "T",
        fillOpacity: 0.5,
        negativeFill: "grey",
        positiveFill: "age",
        fx: "geo",
        z: (d) => `${d.age}, ${d.geo}`,
        sort: {fx: {value: "y", reduce: "mean"}},
        curve: "basis",
        channels: {M: "M", F: "F"},
        tip: true
      })
    ]
  });
}
