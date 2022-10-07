import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

Plot.registerChannel("alpha", {scale: "x"});
Plot.registerChannel("beta");

class CustomMark extends Plot.Mark {
  constructor(data, options = {}) {
    const {alpha, beta} = options;
    super(
      data,
      {
        alpha: {value: alpha},
        beta: {value: beta, optional: true}
      },
      options,
      {}
    );
  }
  render(index, scales, channels, dimensions, context) {
    const {alpha: A, beta: B} = channels;
    return d3
      .create("svg:g", context)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("circle")
          .attr("transform", (i) => `translate(${A[i]}, ${6 + A[i] / 20})`)
          .attr("r", B ? (i) => Math.sqrt(B[i]) : 2)
      )
      .node();
  }
}

function customMark(data, options) {
  return new CustomMark(data, options);
}

export default async function () {
  return customMark(d3.range(41), {
    alpha: (d) => d,
    beta: (d) => d,
    stroke: "red"
  }).plot();
}
