import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/caltrain.csv", d3.autoType);
  const types = ({
    "L": "rgba(183,116,9,1)",
    "B": "rgba(196,62,29,1)",
    "N": "rgba(34,34,34,1)"
  });

  return Plot.plot({
    marks: [
      Plot.text([{label: "Northbound", x: -2.2}, {label: "Southbound", x: 2.2}], {
        x: "x", text: "label", y: () => 3
      }),
      Plot.text(
        new Set(data.map(d => d.hours)),
        {
          x: () => 0, y: h => h,
          text: h => `${(h - 1) % 12 + 1}${(h % 24) >= 12 ? "p": "a"}`
        }),
      Plot.text(data, {
        x: Plot.stackX(data, {
          x: d => d.orientation === "N" ? -1 : 1,
          y: "hours",
          type: "diverging"
        })[1].xm.map(d => d + 0.55 * Math.sign(d)),
        y: "hours",
        text: "minutes",
        fill: "type"
      }),
      Plot.ruleX([-.55, .55], { strokeWidth: 0.5, stroke: "#666" })
    ],
    style: { fontSize: "12px" },
    x: { axis: null, domain: [-7, 7] },
    width: 340,
    y: { domain: Array.from({length: 23}, (_,i) => i + 3), axis: null },
    height: 400,
    color: { domain: Object.keys(types), range: Object.values(types) },
    marginBottom: 20
  });
}
