import * as Plot from "@observablehq/plot";
import * as aq from "arquero";

export default async function() {
  const table = aq.fromCSV(await fetch("data/us-population-state-age.csv").then(d => d.text()))
    .fold(aq.not("name"), {as: ["age", "population"]})
    .groupby("name")
    .derive({percent: d => d.population / aq.op.sum(d.population)});
  return Plot.plot({
    grid: true,
    x: {
      axis: "top",
      label: "Population (%) →",
      percent: true
    },
    y: {
      domain: Plot.valueof(table, "age"),
      label: null
    },
    marks: [
      Plot.tickX(table, {y: "age", x: "percent", title: "name"})
    ]
  });
}
