import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    facet: { data, y: "species", marginRight: 80 },
    marks: [
      Plot.frame(),
      Plot.tickX(data, { y: "island", x: (_, i) => i, strokeWidth: .25 }),
      Plot.dot(
        data,
        Plot.selectFirst({
          y: "island",
          x: 10,
          z: "island",
          anchor: "left",
          fill: "island"
        })
      ),
      Plot.image(
        data,
        Plot.selectFirst(
          Plot.groupZ(
            { y: "mode" },
            {
              x: 10,
              y: "island",
              anchor: "left",
              src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-square"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`
            }
          )
        )
      )
    ],
    x: { insetLeft: 20, insetRight: 5, axis: null },
    marginLeft: 80
  });
}
