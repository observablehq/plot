import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/traffic.csv", d3.autoType);
  const bands = 7;
  const step = +(d3.max(data, d => d.value) / bands).toPrecision(2);
  return Plot.plot({
    facet: { data, y: "name" },
    fy: { axis: null, domain: new Set(data.map((d) => d.name)) },
    x: { axis: "top" },
    y: { axis: null, domain: [0, step] },
    color: { scheme: "blues", range: [0.05, 1], type: "ordinal", legend: true },
    marks: [
      Array.from({length: bands}, (_, i) =>
        Plot.areaY(
          data,
          Plot.sort("date", {
            x: "date",
            y: d => d.value - i * step,
            fill: i * step,
            clip: true
          })
        )
      ),
      Plot.text(data, Plot.selectFirst({ text: "name", frameAnchor: "left" }))
    ],
    height: 1100,
    width: 960
  });
}
