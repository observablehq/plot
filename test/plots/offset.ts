import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {html} from "htl";
import {setOffset} from "../../src/style.js";
import {test} from "test/plot";

test(async function offsets() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return html`${Array.from([0, 0.5], (offset) => {
    setOffset(offset);
    const color = offset ? "blue" : "red";
    return Plot.plot({
      style: "position: absolute; top: 70px;",
      grid: color,
      height: 300,
      marks: [
        Plot.axisX({fill: color, stroke: color}),
        Plot.axisY({fill: color, stroke: color}),
        Plot.rect(
          penguins,
          Plot.bin(
            {fillOpacity: "count"},
            {
              x: "culmen_depth_mm",
              y: "culmen_length_mm",
              fill: color,
              thresholds: 50
            }
          )
        )
      ]
    });
  })}`;
});
