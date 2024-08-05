import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const demographics = d3.csvParse(
  `group,label,freq
Infants <1,0-1,16467
Children <11,1-11,30098
Teens 12-17,12-17,20354
Adults 18+,18+,12456
Elderly 65+,65+,12456`,
  d3.autoType
);

export function waffleSquished() {
  return Plot.waffleX([10]).plot();
}

export function waffleShorthand() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {fill: "currentColor"}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {fill: "red"})
    ]
  });
}

export function waffleStroke() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {fill: "currentColor", stroke: "red", gap: 0}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {fill: "red", stroke: "currentColor", gap: 0})
    ]
  });
}

export function waffleRound() {
  return Plot.plot({
    y: {inset: 12},
    marks: [
      Plot.waffleY([4, 9, 24, 46, 66, 7], {fill: "currentColor", rx: "100%"}),
      Plot.waffleY([-4, -9, -24, -46, -66, -7], {fill: "red", rx: "100%"})
    ]
  });
}

export function waffleStrokeMixed() {
  return Plot.plot({
    y: {insetBottom: 16},
    marks: [
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          y2: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          unit: 0.2,
          fill: "currentColor",
          stroke: "red"
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          y2: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          unit: 0.2,
          gap: 10,
          fill: "red"
        }
      ),
      Plot.ruleY([0])
    ]
  });
}

export function waffleStrokeNegative() {
  return Plot.plot({
    x: {axis: "top"},
    marks: [
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: 0,
          y2: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          y2: [-2.3, -4.5, -6.7, -7.8, -9.1, -10.2],
          unit: 0.2,
          fill: "currentColor",
          stroke: "red"
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          y2: 0,
          gap: 10,
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [-2.3, -4.5, -6.7, -7.8, -9.1, -10.2],
          y2: [-1.1, -2.2, -3.3, -4.4, -5.5, -6.6],
          unit: 0.2,
          gap: 10,
          fill: "red"
        }
      ),
      Plot.ruleY([0])
    ]
  });
}

export function waffleStrokePositive() {
  return Plot.plot({
    marks: [
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: 0,
          y2: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          y2: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          unit: 0.2,
          fill: "currentColor",
          stroke: "red"
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          y2: 0,
          gap: 10,
          unit: 0.2,
          fillOpacity: 0.4
        }
      ),
      Plot.waffleY(
        {length: 6},
        {
          x: ["A", "B", "C", "D", "E", "F"],
          y1: [2.3, 4.5, 6.7, 7.8, 9.1, 10.2],
          y2: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6],
          unit: 0.2,
          gap: 10,
          fill: "red"
        }
      ),
      Plot.ruleY([0])
    ]
  });
}

export function waffleX() {
  return Plot.plot({
    marginLeft: 80,
    y: {label: null},
    color: {scheme: "cool"},
    marks: [
      Plot.axisX({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleX(demographics, {y: "group", fill: "group", x: "freq", unit: 100, sort: {y: null, color: null}}),
      Plot.ruleX([0])
    ]
  });
}

export function waffleXStacked() {
  return Plot.plot({
    height: 240,
    color: {scheme: "cool"},
    marks: [
      Plot.axisX({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleX(demographics, {fill: "group", x: "freq", unit: 100, sort: {color: null}}),
      Plot.ruleX([0])
    ]
  });
}

export function waffleY() {
  return Plot.plot({
    x: {label: null},
    color: {scheme: "cool"},
    marks: [
      Plot.axisY({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleY(demographics, {x: "group", fill: "group", y: "freq", unit: 100, sort: {x: null, color: null}}),
      Plot.ruleY([0])
    ]
  });
}

export function waffleYStacked() {
  return Plot.plot({
    y: {insetTop: 10},
    color: {scheme: "cool", legend: true},
    marks: [
      Plot.axisY({label: "Frequency (thousands)", tickFormat: (d) => d / 1000}),
      Plot.waffleY(demographics, {fill: "group", y: "freq", unit: 100, sort: {color: null}}),
      Plot.ruleY([0])
    ]
  });
}

export async function waffleYGrouped() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginBottom: 100,
    x: {tickRotate: -90, label: null},
    marks: [Plot.waffleY(athletes, Plot.groupX({y: "count"}, {x: "sport", unit: 10})), Plot.ruleY([0])]
  });
}
