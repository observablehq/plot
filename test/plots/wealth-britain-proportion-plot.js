import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const wide = await d3.csv("data/wealth-britain.csv", d3.autoType);
  const columns = wide.columns.slice(1);
  const data = columns.flatMap(type => wide.map(d => ({age: d.age, type, value: d[type]})));
  const stack = options => Plot.stackY({}, {x: "type", y: "value", z: "age", ...options});
  return Plot.plot({
    x: {
      domain: columns,
      axis: "top",
      label: null,
      tickFormat: d => `Share of ${d}`,
      tickSize: 0,
      padding: 0 // see margins
    },
    y: {
      axis: null,
      reverse: true
    },
    color: {
      scheme: "prgn",
      reverse: true
    },
    marginLeft: 50,
    marginRight: 60,
    marks: [
      Plot.areaY(data, stack({
        curve: "bump-x",
        fill: "age",
        stroke: "white"
      })),
      Plot.text(
        data,
        stack({
          filter: d => d.type === "population",
          text: d => `${d.value}%`,
          textAnchor: "end",
          dx: -6
        })
      ),
      Plot.text(
        data,
        stack({
          filter: d => d.type === "wealth",
          text: d => `${d.value}%`,
          textAnchor: "start",
          dx: +6
        })
      ),
      Plot.text(
        data,
        stack({
          filter: d => d.type === "population",
          text: "age",
          textAnchor: "start",
          fill: "white",
          fontWeight: "bold",
          dx: +8
        })
      )
    ]
  });
}
