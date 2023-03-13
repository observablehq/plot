import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {svg} from "htl";

export async function penguinSpeciesGradient() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      () => svg`<defs>
        <linearGradient id="gradient" gradientTransform="rotate(90)">
          <stop offset="5%" stop-color="purple" />
          <stop offset="75%" stop-color="red" />
          <stop offset="100%" stop-color="gold" />
        </linearGradient>
      </defs>`,
      Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "species", fill: "url(#gradient)"})),
      Plot.ruleY([0])
    ]
  });
}
