import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const cars = await d3.csv("data/cars.csv", d3.autoType);
  const dimensions = cars.columns.slice(1);

  // Reshape wide data to make it tidy.
  // TODO Instead of normalizing, separate scales for each dimension.
  const data = dimensions.flatMap(dimension => {
    return cars.map(({name, [dimension]: value}) => {
      return {name, dimension, value};
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
        ...Plot.normalizeX({
          basis: "extent",
          x: "value",
          y: "dimension",
          z: "dimension",
          stroke: "#444",
          strokeWidth: 0.5,
          strokeOpacity: 0.5
        }),
        z: "name"
      })
    ],
    marginLeft: 100
  });
}
