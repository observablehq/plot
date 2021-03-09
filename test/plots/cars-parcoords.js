import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  let data = await d3.csv("data/cars.csv", d3.autoType);
  const dimensions = data.columns.slice(1);

  // Reshape wide data to make it tidy.
  // TODO Instead of normalizing, separate scales for each dimension.
  const scales = new Map();
  data = dimensions.flatMap(c => {
    const scale = d3.scaleLinear().domain(d3.extent(data, d => d[c]));
    scales.set(c, scale);
    return data.map(d => {
      return {
        name: d.name,
        dimension: c,
        value: d[c] == null ? NaN : scale(d[c])
      };
    });
  });
  const ticks = Array.from(scales)
    .flatMap(([dimension, scale]) => scale.ticks().map(t => ({
      value: scale(t),
      tick: t,
      dimension
    }))
  );

  return Plot.plot({
    inset: 6,
    x: {
      domain: [0, 1],
      axis: null
    },
    y: {
      padding: 0.1,
      domain: dimensions,
      label: null
    },
    marks: [
      Plot.ruleY(data, {
        y: "dimension"
      }),
      Plot.line(data, {
        x: "value",
        y: "dimension",
        z: "name",
        stroke: "#444",
        strokeWidth: 0.5,
        strokeOpacity: 0.5
      }),
      Plot.text(data, {
        transform: () => ({data: ticks, index: [d3.range(ticks.length)]}),
        x: "value",
        y: "dimension",
        text: "tick",
        stroke: "white",
        strokeWidth: 3
      }),
      Plot.text(data, {
        transform: () => ({data: ticks, index: [d3.range(ticks.length)]}),
        x: "value",
        y: "dimension",
        text: "tick"
      })
    ],
    marginLeft: 100
  });
}
