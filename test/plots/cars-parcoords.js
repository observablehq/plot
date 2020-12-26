import * as Plot from "@observablehq/plot";
import {extent} from "d3-array";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";
import {scaleLinear} from "d3-scale";

export default async function() {
  let data = await csv("data/cars.csv", autoType);
  const dimensions = data.columns.slice(1);

  // Reshape wide data to make it tidy.
  // TODO Instead of normalizing, separate scales for each dimension.
  data = dimensions.flatMap(c => {
    const scale = scaleLinear().domain(extent(data, d => d[c]));
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
