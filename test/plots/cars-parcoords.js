import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  let data = await d3.csv("data/cars.csv", d3.autoType);
  const dimensions = data.columns.slice(1);

  // Reshape wide data to make it tidy.
  // TODO Instead of normalizing, separate scales for each dimension.
  data = dimensions.flatMap(c => {
    const scale = d3.scaleLinear().domain(d3.extent(data, d => d[c]));
    return data.map(d => {
      return {
        name: d.name,
        dimension: c,
        value: d[c] == null ? NaN : scale(d[c])
      };
    });
  });

  return Plot.plot({
    x: {
      domain: [0, 1]
    },
    y: {
      padding: 0.1,
      domain: dimensions,
      label: null
    },
    marks: [
      Plot.ruleY(data, {
        y: "dimension"
      }),
      Plot.line(data, {
        x: "value",
        y: "dimension",
        z: "name",
        stroke: "#444",
        strokeWidth: 0.5,
        strokeOpacity: 0.5
      })
    ],
    marginLeft: 100
  });
}
