import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function carsParcoords() {
  const cars = await d3.csv<any>("data/cars.csv", d3.autoType);
  const dimensions = cars.columns.slice(1);

  // Reshape wide data to make it tidy.
  const points = dimensions.flatMap((dimension) => {
    return cars.map(({name, year, [dimension]: value}) => {
      return {name, year, dimension, value};
    });
  });

  // Compute normalization scales for each dimension.
  const scales = new Map(
    dimensions.map((dimension) => {
      return [dimension, d3.scaleLinear().domain(d3.extent(cars, (d) => d[dimension]))];
    })
  );

  // Compute ticks for each dimension.
  const ticks = dimensions.flatMap((dimension) => {
    return scales
      .get(dimension)
      .ticks(7)
      .map((value) => ({dimension, value}));
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
      Plot.lineX(points, {
        x: (d) => scales.get(d.dimension)(d.value),
        y: "dimension",
        z: (d) => `${d.name}-${d.year}`,
        stroke: "#444",
        strokeWidth: 0.5,
        strokeOpacity: 0.5
      }),
      Plot.text(ticks, {
        x: (d) => scales.get(d.dimension)(d.value),
        y: "dimension",
        text: "value",
        fill: "black",
        stroke: "white",
        strokeWidth: 3
      })
    ]
  });
}
