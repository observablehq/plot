import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {hexbin as Hexbin} from "d3-hexbin";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(penguins, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        symbol: "hexagon",
        initialize([index], {x: {value: X}, y: {value: Y}}, {x, y}) {
          const radius = 12;
          const bins = Hexbin().x(i => x(X[i])).y(i => y(Y[i])).radius(radius * 2 / Math.sqrt(3))(index);
          return {
            facets: [d3.range(bins.length)],
            channels: {
              x: {value: bins.map(bin => bin.x)},
              y: {value: bins.map(bin => bin.y)},
              r: {value: bins.map(bin => bin.length), radius, scale: "r"}
            }
          };
        }
      })
    ]
  });
}
