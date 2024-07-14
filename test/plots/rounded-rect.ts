import * as Plot from "@observablehq/plot";

export function roundedBarYR() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.barY({length: 1}, {x: 0, ...xy, r: 25}),
      Plot.barY({length: 1}, {x: 1, ...xy, r: 50}),
      Plot.barY({length: 1}, {x: 2, ...xy, r: 75}),
      Plot.barY({length: 1}, {x: 3, ...xy, r: 100})
    ]
  });
}

export function roundedBarYRx() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.barY({length: 1}, {x: 0, ...xy, rx: 25}),
      Plot.barY({length: 1}, {x: 1, ...xy, rx: 50}),
      Plot.barY({length: 1}, {x: 2, ...xy, rx: 75}),
      Plot.barY({length: 1}, {x: 3, ...xy, rx: 100})
    ]
  });
}

export function roundedBarYRy() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.barY({length: 1}, {x: 0, ...xy, ry: 25}),
      Plot.barY({length: 1}, {x: 1, ...xy, ry: 50}),
      Plot.barY({length: 1}, {x: 2, ...xy, ry: 75}),
      Plot.barY({length: 1}, {x: 3, ...xy, ry: 100})
    ]
  });
}

export function roundedRectR() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x: 0, ...xy, r: 25}),
      Plot.rect({length: 1}, {x: 1, ...xy, r: 50}),
      Plot.rect({length: 1}, {x: 2, ...xy, r: 75}),
      Plot.rect({length: 1}, {x: 3, ...xy, r: 100})
    ]
  });
}

export function roundedRectRx() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x: 0, ...xy, rx: 25}),
      Plot.rect({length: 1}, {x: 1, ...xy, rx: 50}),
      Plot.rect({length: 1}, {x: 2, ...xy, rx: 75}),
      Plot.rect({length: 1}, {x: 3, ...xy, rx: 100})
    ]
  });
}

export function roundedRectRy() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x: 0, ...xy, ry: 25}),
      Plot.rect({length: 1}, {x: 1, ...xy, ry: 50}),
      Plot.rect({length: 1}, {x: 2, ...xy, ry: 75}),
      Plot.rect({length: 1}, {x: 3, ...xy, ry: 100})
    ]
  });
}

export function roundedRectAsymmetricX() {
  const xy = {y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2};
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x: 0, ...xy, rx1y1: 500, rx2y1: 50}),
      Plot.rect({length: 1}, {x: 1, ...xy, rx2y1: 500, rx1y1: 50}),
      Plot.rect({length: 1}, {x: 2, ...xy, rx2y2: 500, rx1y2: 50}),
      Plot.rect({length: 1}, {x: 3, ...xy, rx1y2: 500, rx2y2: 50})
    ]
  });
}

export function roundedRectAsymmetricY() {
  const xy = {x1: 0, x2: 1, inset: 4, insetTop: 2, insetBottom: 2};
  return Plot.plot({
    y: {inset: 2},
    height: 400,
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {y: 0, ...xy, rx1y1: 500, rx1y2: 50}),
      Plot.rect({length: 1}, {y: 1, ...xy, rx2y1: 500, rx2y2: 50}),
      Plot.rect({length: 1}, {y: 2, ...xy, rx2y2: 500, rx2y1: 50}),
      Plot.rect({length: 1}, {y: 3, ...xy, rx1y2: 500, rx1y1: 50})
    ]
  });
}

export function roundedRectCorners() {
  return Plot.plot({
    y: {reverse: true},
    inset: 4,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x1: 0, x2: 1, y1: 0, y2: 1, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 2, y1: 0, y2: 1, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 3, y1: 0, y2: 1, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 4, y1: 0, y2: 1, inset: 4, rx1y2: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 0, y1: 1, y2: 2, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 1, y1: 1, y2: 2, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 2, y1: 1, y2: 2, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {x1: 4, x2: 3, y1: 1, y2: 2, inset: 4, rx1y2: 20}),
      Plot.rect({length: 1}, {x1: 0, x2: 1, y1: 3, y2: 2, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 2, y1: 3, y2: 2, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 3, y1: 3, y2: 2, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 4, y1: 3, y2: 2, inset: 4, rx1y2: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 0, y1: 4, y2: 3, inset: 4, rx1y1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 1, y1: 4, y2: 3, inset: 4, rx2y1: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 2, y1: 4, y2: 3, inset: 4, rx2y2: 20}),
      Plot.rect({length: 1}, {x1: 4, x2: 3, y1: 4, y2: 3, inset: 4, rx1y2: 20})
    ]
  });
}

export function roundedRectBand() {
  return Plot.plot({
    x: {inset: 2},
    y: {reverse: true},
    padding: 0,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x: 1, y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2, ry1: 20}),
      Plot.rect({length: 1}, {x: 2, y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2, ry1: 20}),
      Plot.rect({length: 1}, {x: 3, y1: 0, y2: 1, inset: 4, insetLeft: 2, insetRight: 2, ry1: 20})
    ]
  });
}

export function roundedRectCollapsedX() {
  return Plot.plot({
    y: {reverse: true},
    marks: [Plot.frame(), Plot.rect({length: 1}, {x2: 1, y1: 0, y2: 1, inset: 4, ry1: 20})]
  });
}

export function roundedRectCollapsedY() {
  return Plot.plot({
    marks: [Plot.frame(), Plot.rect({length: 1}, {x1: 0, x2: 1, y2: 1, inset: 4, ry1: 20})]
  });
}

export function roundedRectSides() {
  return Plot.plot({
    y: {reverse: true},
    inset: 4,
    marks: [
      Plot.frame(),
      Plot.rect({length: 1}, {x1: 0, x2: 1, y1: 0, y2: 1, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 2, y1: 0, y2: 1, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 3, y1: 0, y2: 1, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 4, y1: 0, y2: 1, inset: 4, ry2: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 0, y1: 1, y2: 2, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 1, y1: 1, y2: 2, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 2, y1: 1, y2: 2, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {x1: 4, x2: 3, y1: 1, y2: 2, inset: 4, ry2: 20}),
      Plot.rect({length: 1}, {x1: 0, x2: 1, y1: 3, y2: 2, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 2, y1: 3, y2: 2, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 3, y1: 3, y2: 2, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 4, y1: 3, y2: 2, inset: 4, ry2: 20}),
      Plot.rect({length: 1}, {x1: 1, x2: 0, y1: 4, y2: 3, inset: 4, rx1: 20}),
      Plot.rect({length: 1}, {x1: 2, x2: 1, y1: 4, y2: 3, inset: 4, ry1: 20}),
      Plot.rect({length: 1}, {x1: 3, x2: 2, y1: 4, y2: 3, inset: 4, rx2: 20}),
      Plot.rect({length: 1}, {x1: 4, x2: 3, y1: 4, y2: 3, inset: 4, ry2: 20})
    ]
  });
}
