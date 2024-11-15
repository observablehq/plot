import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function nestedFacets() {
  const diamonds = await d3.csv<any>("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 480,
    fx: {domain: ["D", "E", "F"]},
    color: {legend: "ramp", domain: ["IF", "SI1", "I1"]},
    y: {domain: [51, 71.9], insetTop: 20, labelAnchor: "center"},
    marginLeft: 40,
    marginBottom: 40,
    marginTop: 35,
    marks: [
      Plot.axisFx({anchor: "top"}),
      Plot.frame({anchor: "top", strokeOpacity: 1}),
      Plot.dot(diamonds, {
        fx: "color", // outer x facet
        y: "depth", // shared y scale
        fill: "clarity", // shared color scale
        render(index, {scales}, _values, {facet, ...dimensions}) {
          const data = Array.from(index, (i) => this.data[i]); // subplot dataset as a subset of the data
          return Plot.plot({
            ...dimensions,
            marginTop: 60,
            ...scales, // shared color scale, shared y scale
            fx: {axis: "bottom", paddingOuter: 0.1, paddingInner: 0.2}, // inner x facet
            x: {
              domain: scales.color.domain,
              axis: "top",
              labelAnchor: "left",
              labelOffset: 16,
              ...(index["fi"] && {label: null}),
              grid: true,
              tickSize: 0
            }, // new x scale with a common domain and additional axis options
            y: {...scales.y, grid: 4, axis: null}, // shared y scale with additional options
            marks: [
              Plot.frame({anchor: "bottom"}),
              Plot.boxY(data, {
                fx: "cut",
                x: "clarity",
                y: "depth",
                fill: "clarity"
              })
            ]
          }) as SVGElement;
        }
      })
    ]
  });
}
