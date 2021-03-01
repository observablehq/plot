import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/caltrain.csv", d3.autoType);
  const types = {
    L: "rgb(183, 116, 9)",
    B: "rgb(196, 62, 29)",
    N: "rgb(34, 34, 34)"
  };

  function selectX({x1, x2, ...rest}, position) {
    return {
      x: {
        transform() {
          const X1 = x1.transform();
          const X2 = x2.transform();
          return position === "right" ? X2
            : position === "left" ? X1
            : Float64Array.from(X1, (_, i) => (X1[i] + X2[i]) / 2);
        }
      },
      ...rest
    };
  }

  return Plot.plot({
    x: {
      axis: null,
      domain: [-7, 7],
      transform: d => d + 0.55 * Math.sign(d)
    },
    y: {
      domain: Array.from({length: 23}, (_, i) => i + 3),
      axis: null
    },
    color: {
      domain: Object.keys(types),
      range: Object.values(types)
    },
    width: 340,
    height: 400,
    marginBottom: 20,
    style: {
      fontSize: "12px"
    },
    marks: [
      Plot.text([
        {label: "Northbound", x: -1.65},
        {label: "Southbound", x: 1.65}
      ], {
        x: "x",
        text: "label",
        y: () => 3 // XXX
      }),
      Plot.text(
        new Set(data.map(d => d.hours)),
        {
          x: () => 0, // XXX
          y: h => h,
          text: h => `${(h - 1) % 12 + 1}${(h % 24) >= 12 ? "p": "a"}`
        }
      ),
      Plot.text(
        data,
        selectX(Plot.stackX({
          x: d => d.orientation === "N" ? -1 : 1,
          y: "hours",
          text: "minutes",
          fill: "type"
        }))
      ),
      Plot.ruleX([-0.001, 0.001], {strokeWidth: 0.5, stroke: "#666"})
    ]
  });
}
