import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {html} from "htl";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.plot({
    height: 300,
    grid: true,
    facet: {
      data,
      x: "sex",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(data, {
        facet: "exclude",
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        r: 2,
        fill: "#ddd"
      }),
      Plot.dot(data, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm"
      }),
      Plot.lasso(data, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        fill: "green"
      })
    ]
  });
  const output = html`<output>`;
  plot.oninput = () => output.value = plot.value.length;
  plot.oninput();
  return html`${plot}${output}`;
}
