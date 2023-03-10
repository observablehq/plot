import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as aq from "arquero";

export async function travelersCovidDrop() {
  const travelers = await d3.csv("data/travelers.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    y: {
      grid: true,
      zero: true,
      label: "↓ Drop in passenger throughput (2020 vs. 2019)",
      tickFormat: "%"
    },
    marks: [
      Plot.lineY(travelers, {x: "date", y: (d) => d.current / d.previous - 1, strokeWidth: 0.25, curve: "step"}),
      Plot.lineY(
        travelers,
        Plot.windowY({x: "date", y: (d) => d.current / d.previous - 1, k: 7, strict: true, stroke: "steelblue"})
      )
    ]
  });
}

export async function travelersCovidDropArquero() {
  const travelers = aq.from(await d3.csv("data/travelers.csv", d3.autoType));
  return Plot.plot({
    width: 960,
    y: {
      grid: true,
      zero: true,
      label: "↓ Drop in passenger throughput (2020 vs. 2019)",
      tickFormat: "%"
    },
    marks: [
      Plot.lineY(travelers, {x: "date", y: (d) => d.current / d.previous - 1, strokeWidth: 0.25, curve: "step"}),
      Plot.lineY(
        travelers,
        Plot.windowY({x: "date", y: (d) => d.current / d.previous - 1, k: 7, strict: true, stroke: "steelblue"})
      )
    ]
  });
}

export async function travelersCovidDropColumnar() {
  const raw = await d3.csv("data/travelers.csv", d3.autoType);
  const travelers = {
    date: Plot.valueof(raw, "date"),
    current: Plot.valueof(raw, "current"),
    previous: Plot.valueof(raw, "previous")
  };
  return Plot.plot({
    width: 960,
    y: {
      grid: true,
      zero: true,
      label: "↓ Drop in passenger throughput (2020 vs. 2019)",
      tickFormat: "%"
    },
    marks: [
      Plot.lineY(travelers, {x: "date", y: (d) => d.current / d.previous - 1, strokeWidth: 0.25, curve: "step"}),
      Plot.lineY(
        travelers,
        Plot.windowY({x: "date", y: (d) => d.current / d.previous - 1, k: 7, strict: true, stroke: "steelblue"})
      )
    ]
  });
}
