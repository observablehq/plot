import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function youngAdults() {
  const ages = ["Y16-19", "Y20-24", "Y25-29"];
  const geos = ["SE", "FR", "DE", "TR", "IT"];
  const ilc_lvps08 = await d3.csv<any>("data/ilc_lvps08.csv", (d) =>
    ages.includes(d.age) && geos.includes(d.geo) ? d3.autoType(d) : null
  );
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
      Plot.differenceY(
        ilc_lvps08,
        Plot.groupX(
          {
            y1: Plot.find((d) => d.sex === "F"),
            y2: Plot.find((d) => d.sex === "M"),
            positiveFill: "first"
          },
          {
            x: "TIME_PERIOD",
            y: "OBS_VALUE",
            negativeFill: "grey",
            positiveFill: "age",
            z: "age",
            sort: {fx: {value: "y", reduce: "mean"}},
            fillOpacity: 0.5,
            fx: "geo",
            curve: "basis",
            tip: true
          }
        )
      )
    ]
  });
}
