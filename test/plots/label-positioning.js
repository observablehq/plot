import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = d3.cross(["top", "", "bottom"], ["left", "", "right"]);
  return Plot.plot({
    facet: {
      data,
      x: "1",
      y: "0",
      marginLeft: 50
    },
    fx: { label: null, domain: ["left", "", "right"], padding: 0.2, inset: 20 },
    fy: { label: null, domain: ["top", "", "bottom"], padding: 0.2, inset: 20 },
    marks: [
      Plot.frame({stroke: "#eee"}),
      data.map(d => Plot.text(data, {
        filter: p => p === d,
        text: p => p.filter(x => x).join("-").toUpperCase() || "—",
        anchor: d.filter(x => x).join("-"),
        y: d[0] === "top" ? 10 : d[0] === "bottom" ? -10 : 0,
        x: d[1] === "left" ? 5 : d[1] === "right" ? -5 : 0,
        textAnchor: d[1] === "left" ? "start" : d[1] === "right" ? "end" : null
      }))
    ],
    height: 400,
    marginLeft: 60

  });
}
