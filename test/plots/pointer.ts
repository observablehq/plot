import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {html} from "htl";

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

export async function pointerViewof() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const plot = Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", tip: true}).plot();
  plot.oninput = () => textarea.value = JSON.stringify(plot.value, null, 2);
  return html`<figure>${plot}${textarea}</figure>`;
}
