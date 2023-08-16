import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as htl from "htl";

export async function renderInstantiatedScales() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.dot(
    penguins,
    Plot.hexbin(
      {fill: "count", r: "count"},
      {
        stroke: "white",
        x: "culmen_length_mm",
        y: "culmen_depth_mm",
        render(index, scales, values, dimensions, context, next) {
          const w = (dimensions.width + dimensions.marginLeft - dimensions.marginRight) / 2;
          const h = (dimensions.height + dimensions.marginTop - dimensions.marginBottom) / 2;
          return htl.svg`
      ${next(index, scales, values, dimensions, context)}
      ${d3
        .select(context.ownerSVGElement)
        .append("g")
        .call((g) =>
          g
            .selectAll()
            .data(Object.entries(scales.scales))
            .join("text")
            .attr("x", w)
            .attr("y", (d, i) => h + 16 * i)
            .text(([key, scale]) => `${key}: ${JSON.stringify(scale)}`)
        )
        .node()}`;
        }
      }
    )
  ).plot({width: 700, color: {scheme: "Blues", range: [0, 0.2]}});
}
