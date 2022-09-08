import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const parse = d3.utcParse("%m/%d/%Y");
const projection = d3.geoAlbersUsa().scale(300).translate([150, 80]);

export default async function () {
  const walmart = await d3.tsv("data/walmart.tsv", (d) => ({
    ...projection([d.longitude, d.latitude]),
    date: parse(d.date)
  }));
  return Plot.plot({
    width: 300,
    facet: {
      data: walmart,
      y: (d) => ((d.date.getUTCFullYear() / 10) | 0) * 10
    },
    x: {type: "identity", axis: null},
    y: {type: "identity", axis: null},
    fy: {tickFormat: "d", reverse: true},
    marks: [
      Plot.dot(walmart, {
        x: "0",
        y: "1",
        fill: "#ccc",
        r: 2,
        yFilter: "lt"
      }),
      Plot.dot(walmart, {
        x: "0",
        y: "1",
        fill: "date"
      })
    ]
  });
}
