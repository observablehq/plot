import * as Plot from "@observablehq/plot";

export async function integerInterval() {
  const requests = [
    [2, 9],
    [3, 17],
    [3.5, 10],
    [5, 12]
  ];
  return Plot.plot({
    x: {interval: 1},
    y: {zero: true},
    marks: [Plot.line(requests)]
  });
}

export async function integerIntervalArea() {
  const series = [
    {x: 0, y: 5, type: "a"},
    {x: 5, y: 7, type: "a"},
    {x: 5, y: 9, type: "b"},
    {x: 10, y: 4, type: "b"}
  ];
  return Plot.plot({
    color: {legend: true},
    marks: [
      Plot.areaY(series, {
        interval: 5,
        x: "x",
        y: "y",
        fill: "type",
        stroke: "type",
        strokeWidth: 2,
        fillOpacity: 0.7,
        tip: true
      })
    ]
  });
}

export async function integerIntervalAreaZ() {
  const series = [
    {x: 0, y: 5, type: "a", category: "P"},
    {x: 1, y: 7, type: "a", category: "P"},
    {x: 1, y: 9, type: "b", category: "P"},
    {x: 2, y: 4, type: "b", category: "P"},
    {x: 1, y: 1, type: "c", category: "R"},
    {x: 3, y: 7, type: "c", category: "R"}
  ];
  return Plot.plot({
    x: {interval: 1},
    color: {scheme: "Paired", legend: true},
    marks: [
      Plot.areaY(series, {
        x: "x",
        y: "y",
        interval: 1,
        fill: "type",
        stroke: "category",
        z: "type",
        strokeWidth: 2,
        fillOpacity: 0.7,
        tip: true
      })
    ]
  });
}
