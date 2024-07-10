import * as Plot from "@observablehq/plot";

export function roundedRect() {
  return Plot.plot({
    y: {reverse: true},
    inset: 4,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 0, x2: 1, y1: 0, y2: 1, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 1, x2: 2, y1: 0, y2: 1, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 2, x2: 3, y1: 0, y2: 1, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 3, x2: 4, y1: 0, y2: 1, inset: 4, rx1y2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 1, x2: 0, y1: 1, y2: 2, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 2, x2: 1, y1: 1, y2: 2, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 3, x2: 2, y1: 1, y2: 2, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 4, x2: 3, y1: 1, y2: 2, inset: 4, rx1y2: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 0, x2: 1, y1: 3, y2: 2, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 1, x2: 2, y1: 3, y2: 2, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 2, x2: 3, y1: 3, y2: 2, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 3, x2: 4, y1: 3, y2: 2, inset: 4, rx1y2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 1, x2: 0, y1: 4, y2: 3, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 2, x2: 1, y1: 4, y2: 3, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 3, x2: 2, y1: 4, y2: 3, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 4, x2: 3, y1: 4, y2: 3, inset: 4, rx1y2: 20})
    ]
  });
}

export function roundedRectSides() {
  return Plot.plot({
    y: {reverse: true},
    inset: 4,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 0, x2: 1, y1: 0, y2: 1, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 1, x2: 2, y1: 0, y2: 1, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 2, x2: 3, y1: 0, y2: 1, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {fill: ["x1y1x2y2"], x1: 3, x2: 4, y1: 0, y2: 1, inset: 4, ry2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 1, x2: 0, y1: 1, y2: 2, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 2, x2: 1, y1: 1, y2: 2, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 3, x2: 2, y1: 1, y2: 2, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y1x1y2"], x1: 4, x2: 3, y1: 1, y2: 2, inset: 4, ry2: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 0, x2: 1, y1: 3, y2: 2, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 1, x2: 2, y1: 3, y2: 2, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 2, x2: 3, y1: 3, y2: 2, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {fill: ["x1y2x2y1"], x1: 3, x2: 4, y1: 3, y2: 2, inset: 4, ry2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 1, x2: 0, y1: 4, y2: 3, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 2, x2: 1, y1: 4, y2: 3, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 3, x2: 2, y1: 4, y2: 3, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {fill: ["x2y2x1y1"], x1: 4, x2: 3, y1: 4, y2: 3, inset: 4, ry2: 20})
    ]
  });
}
