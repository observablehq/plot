// Verify that mark classes can be extended with a custom render.
// See https://github.com/observablehq/plot/issues/2422

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

interface RotatedRectOptions extends Plot.RectOptions {
  rx?: number;
}

class RotatedRect extends Plot.Rect {
  private rx: number;
  constructor(data: Plot.Data, {rx = 0, ...options}: RotatedRectOptions = {}) {
    super(data, options);
    this.rx = rx;
  }
  render(
    index: number[],
    scales: Plot.ScaleFunctions,
    values: Plot.ChannelValues,
    dimensions: Plot.Dimensions,
    context: Plot.Context
  ) {
    const g = super.render(index, scales, values, dimensions, context);
    if (g) {
      let i = 0;
      for (const rect of g.querySelectorAll("rect")) {
        const x = +rect.getAttribute("x")! + +rect.getAttribute("width")! / 2;
        const y = +rect.getAttribute("y")! + +rect.getAttribute("height")! / 2;
        rect.setAttribute("transform", `rotate(${i++ * 10}, ${x}, ${y})`);
        if (this.rx) rect.setAttribute("rx", `${this.rx}`);
      }
    }
    return g;
  }
}

test(function rectRotate() {
  const colors = d3.schemeObservable10;
  return Plot.plot({
    width: 330,
    height: 60,
    margin: 15,
    axis: null,
    color: {domain: d3.range(10), range: colors},
    marks: [
      new RotatedRect(d3.range(10), {
        x1: Plot.identity,
        x2: (d) => d + 1,
        y1: 0,
        y2: 1,
        fill: Plot.identity,
        stroke: "white",
        inset: -2,
        rx: 8
      }),
      Plot.vector(d3.range(10), {
        x: (d) => d + 0.5,
        y: 0.5,
        rotate: (d) => d * 10,
        stroke: "white",
        length: 10,
        strokeWidth: 1.5
      })
    ]
  });
});
