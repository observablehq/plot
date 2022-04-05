import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const cars = await d3.csv("data/cars.csv", d3.autoType);
  const dimensions = cars.columns.slice(1);

  // Reshape wide data to make it tidy.
  const data = dimensions.flatMap(dimension => {
    return cars.map(({name, year, [dimension]: value}) => {
      return {name: `${name}-${year}`, dimension, value};
    });
  });

  // Compute ticks for each dimension.
  const ticks = dimensions.flatMap(dimension => {
    return d3.ticks(...d3.extent(cars, d => d[dimension]), 7).map(value => {
      return {dimension, value};
    });
  });

  // Normalize the x-position based on the extent for each dimension.
  const xy = Plot.normalizeX("extent", {x: "value", y: "dimension", z: "dimension"});

  return Plot.plot({
    marginLeft: 104,
    marginRight: 20,
    x: {
      axis: null
    },
    y: {
      padding: 0.1,
      domain: dimensions,
      label: null,
      tickPadding: 9
    },
    marks: [
      Plot.ruleY(dimensions),
      Plot.line(data, {...xy, z: "name", stroke: "#444", strokeWidth: 0.5, strokeOpacity: 0.5}),
      Plot.text(ticks, {...xy, text: "value", fill: "black", stroke: "white"})
    ]
  });
}
