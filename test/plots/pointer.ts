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
  const plot = Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", tip: true}).plot();
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = JSON.stringify(plot.value, null, 2));
  oninput(); // initialize the textarea to the initial value
  plot.oninput = oninput; // update during interaction
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function pointerViewofTitle() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", tip: true}).plot({title: "Penguins"});
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => (textarea.value = JSON.stringify(plot.value, null, 2));
  oninput(); // initialize the textarea to the initial value
  plot.oninput = oninput; // update during interaction
  return html`<figure>${plot}${textarea}</figure>`;
}

export async function pointerNonFaceted() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.lineY(aapl, {x: "Date", y: "Close", fy: (d) => d.Close % 2 === 0}),
      Plot.ruleX(aapl, {x: "Date", strokeOpacity: 0.1}),
      Plot.ruleX(aapl, Plot.pointerX({x: "Date", stroke: "red"}))
    ]
  });
}
