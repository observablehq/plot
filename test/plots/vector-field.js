import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default function() {
  return Plot.plot({
    inset: 12,
    height: 600,
    marks: [
      Plot.vector(
        (T => d3.cross(T, T))(d3.ticks(0, 2 * Math.PI, 20)),
        {
          length: ([x, y]) => (x + y) * 2 + 2,
          rotate: ([x, y]) => (Math.sin(x) - Math.sin(y)) * 60
        }
      )
    ]
  });
}
