import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

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

export async function roundedRectNegativeX() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    height: 640,
    marks: [
      Plot.rectX(olympians, Plot.binY({x: "count"}, {rx2: 4, rx1: -4, clip: "frame", y: "weight", fill: "sex"})),
      Plot.ruleX([0])
    ]
  });
}

export async function roundedRectNegativeY() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [
      Plot.rectY(olympians, Plot.binX({y: "count"}, {ry2: 4, ry1: -4, clip: "frame", x: "weight", fill: "sex"})),
      Plot.ruleY([0])
    ]
  });
}

export async function roundedRectNegativeY1() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [
      Plot.rectY(olympians, Plot.binX({y: "count"}, {rx1y2: 4, rx1y1: -4, clip: "frame", x: "weight", fill: "sex"})),
      Plot.ruleY([0])
    ]
  });
}

export function roundedRectOpposing() {
  return Plot.plot({
    height: 400,
    padding: 0,
    inset: 10,
    round: false,
    marks: [
      Plot.frame(),
      Plot.cell({length: 1}, {x: 0, y: 0, inset: 10, rx1y1: 20, rx2y1: 20, rx2y2: 20, rx1y2: 20}),
      Plot.cell({length: 1}, {x: 1, y: 0, inset: 10, rx1y1: -20, rx2y1: 20, rx2y2: 20, rx1y2: 20}),
      Plot.cell({length: 1}, {x: 2, y: 0, inset: 10, rx1y1: 20, rx2y1: -20, rx2y2: 20, rx1y2: 20}),
      Plot.cell({length: 1}, {x: 3, y: 0, inset: 10, rx1y1: -20, rx2y1: -20, rx2y2: 20, rx1y2: 20, fill: "#5ca75b"}),
      Plot.cell({length: 1}, {x: 0, y: 1, inset: 10, rx1y1: 20, rx2y1: 20, rx2y2: -20, rx1y2: 20}),
      Plot.cell({length: 1}, {x: 1, y: 1, inset: 10, rx1y1: -20, rx2y1: 20, rx2y2: -20, rx1y2: 20}),
      Plot.cell({length: 1}, {x: 2, y: 1, inset: 10, rx1y1: 20, rx2y1: -20, rx2y2: -20, rx1y2: 20, fill: "#5ca75b"}),
      Plot.cell({length: 1}, {x: 3, y: 1, inset: 10, rx1y1: -20, rx2y1: -20, rx2y2: -20, rx1y2: 20}),
      Plot.cell({length: 1}, {x: 0, y: 2, inset: 10, rx1y1: 20, rx2y1: 20, rx2y2: 20, rx1y2: -20}),
      Plot.cell({length: 1}, {x: 1, y: 2, inset: 10, rx1y1: -20, rx2y1: 20, rx2y2: 20, rx1y2: -20, fill: "#5ca75b"}),
      Plot.cell({length: 1}, {x: 2, y: 2, inset: 10, rx1y1: 20, rx2y1: -20, rx2y2: 20, rx1y2: -20}),
      Plot.cell({length: 1}, {x: 3, y: 2, inset: 10, rx1y1: -20, rx2y1: -20, rx2y2: 20, rx1y2: -20}),
      Plot.cell({length: 1}, {x: 0, y: 3, inset: 10, rx1y1: 20, rx2y1: 20, rx2y2: -20, rx1y2: -20, fill: "#5ca75b"}),
      Plot.cell({length: 1}, {x: 1, y: 3, inset: 10, rx1y1: -20, rx2y1: 20, rx2y2: -20, rx1y2: -20}),
      Plot.cell({length: 1}, {x: 2, y: 3, inset: 10, rx1y1: 20, rx2y1: -20, rx2y2: -20, rx1y2: -20}),
      Plot.cell({length: 1}, {x: 3, y: 3, inset: 10, rx1y1: -20, rx2y1: -20, rx2y2: -20, rx1y2: -20})
    ]
  });
}
