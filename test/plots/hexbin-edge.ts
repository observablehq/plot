import * as Plot from "@observablehq/plot";

// Regression test: when a data value lands exactly on a hexbin grid boundary
// (a half-integer in bin-index space), the rounding must go toward the interior
// of the plot rather than creating a floating bin outside the frame. With
// width=630, margin=0, inset=20, binWidth=20, the right edge is at pixel 610.
// 610/20 = 30.5 — a tie. Math.round(30.5) = 31, which would place the bin at
// 620, outside the frame. The center-directed rounding breaks this tie toward
// the interior (30), placing the bin at 600 instead. Similarly, on the left
// edge at pixel 20, odd-row bins land at 0.5 and round up (toward center) to
// 1, keeping them at 30 instead of floating outside at 10.
export async function hexbinEdge() {
  const w = 630,
    h = 400,
    n = 190;
  const nh = Math.round((n * h) / (w + h));
  const nw = n - nh;
  const data = [
    ...Array.from({length: nw}, (_, i) => [i / (nw - 1), 0]),
    ...Array.from({ length: nw }, (_, i) => [i / (nw - 1), 1]),
    ...Array.from({length: nh}, (_, i) => [0, i / (nh - 1)]),
    ...Array.from({length: nh}, (_, i) => [1, i / (nh - 1)])
  ];
  return Plot.plot({
    width: w,
    height: h,
    margin: 0,
    axis: null,
    inset: 20,
    marks: [
      Plot.dot(data, Plot.hexbin({}, {binWidth: 20, stroke: "currentColor"})),
      Plot.dot(data, {r: 1, fill: "red"})
    ]
  });
}
