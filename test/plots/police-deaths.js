import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const wide = await d3.csv("data/police-deaths.csv", d3.autoType);
  const columns = wide.columns.slice(1);
  const data = columns.flatMap(type => wide.map(d => ({race: d.race, type, value: d[type]})));
  const stack = {x: "type", y: "value", z: "race", order: d3.sort(wide, d => d.police).map(d => d.race)};
  return Plot.plot({
    marginLeft: 100,
    marginRight: 100,
    x: {
      domain: columns,
      axis: "top",
      label: "",
      tickFormat: d => d === "population" ? "Share of population" : "Share of deaths by police",
      padding: 0 // see margins
    },
    y: {
      axis: null
    },
    marks: [
      Plot.areaY(data, Plot.stackY({
        ...stack,
        curve: "bump-x",
        fill: "race",
        stroke: "white"
      })),
      Plot.text(
        data.filter(d => d.type === "police"),
        Plot.stackY({
          ...stack,
          text: d => `${d.race} ${d.value}%`,
          textAnchor: "end",
          dx: -6
        })
      ),
      Plot.text(
        data.filter(d => d.type === "population"),
        Plot.stackY({
          ...stack,
          text: d => `${d.race} ${d.value}%`,
          textAnchor: "start",
          dx: +6
        })
      )
    ]
  });
}
