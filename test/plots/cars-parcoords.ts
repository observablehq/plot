import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function carsParcoords() {
  const cars = await d3.csv<any>("data/cars.csv", d3.autoType);
  const dimensions = cars.columns.slice(1);

  // Reshape wide data to make it tidy.
  const points = dimensions.flatMap((dimension: string) => {
    return cars.map(({name, year, [dimension]: value}) => {
      return {id: `${name}-${year}`, dimension, value};
    });
  });

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
      Plot.line(points, {
        // Normalize the x-position based on the extent for each dimension.
        ...Plot.normalizeX("extent", {x: "value", y: "dimension", z: "dimension"}),
        // Create a line for each car
        z: "id",
        stroke: "#444",
        strokeWidth: 0.5,
        strokeOpacity: 0.5
      }),
      dimensions.map((dimension) => {
        const [min, max] = d3.extent(cars, (d) => d[dimension]);
        const ticks = d3.ticks(min, max, 7);
        return Plot.text(
          // Normalize the x-position based on the true extent (including min and max).
          [...ticks, min, max],
          Plot.normalizeX({
            basis: "extent",
            x: Plot.identity,
            text: ticks, // Ignores min and max.
            y: () => dimension, // Constant y.
            fill: "black",
            stroke: "white",
            strokeWidth: 3
          })
        );
      })
    ]
  });
}
