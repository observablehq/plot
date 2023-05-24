import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function pointerRenderCompose() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(
        penguins,
        Plot.pointer({
          x: "culmen_length_mm",
          y: "culmen_depth_mm",
          r: 8,
          fill: "red",
          render(index, scales, values, dimensions, context, next) {
            const node = next(index, scales, values, dimensions, context);
            node.setAttribute("fill", "blue");
            return node;
          }
        })
      ),
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
    ]
  });
}
