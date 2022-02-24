import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {html} from "htl";

export default async function() {
  const data = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.plot({
    x: {
      type: "band"
    },
    y: {
      label: "↑ Temperature anomaly (°C)",
      tickFormat: "+f",
      grid: true
    },
    color: {
      type: "diverging",
      reverse: true
    },
    marks: [
      Plot.ruleY([0]),
      Plot.tickY(data, {x: d => `${Math.floor(d.Date.getUTCFullYear() / 10)}0`, y: "Anomaly", stroke: "Anomaly"}),
      Plot.pointer(data, {x: d => `${Math.floor(d.Date.getUTCFullYear() / 10)}0`, y: "Anomaly", n: 5})
    ]
  });
  const output = html`<output>`;
  plot.oninput = () => output.value = plot.value.length;
  plot.oninput();
  return html`${plot}${output}`;
}
