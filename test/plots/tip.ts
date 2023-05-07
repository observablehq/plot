import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function tipDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {
        x: "culmen_length_mm",
        y: "culmen_depth_mm"
      }),
      Plot.tip(penguins, {
        x: "culmen_length_mm",
        y: "culmen_depth_mm",
        render(index, ...args) {
          const mark = this;
          let i = 0;
          index = d3.sort(index, (i) => penguins[i].culmen_length_mm);
          let g = mark._render([index[i]], ...args);
          setTimeout(function tick() {
            if (!g.isConnected) return;
            g.replaceWith((g = mark._render([index[(i = (i + 1) % index.length)]], ...args)));
            setTimeout(tick, 100);
          }, 100);
          return g;
        }
      })
    ]
  });
}
