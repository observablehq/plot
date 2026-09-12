// Tests that z specified as {value} is unwrapped correctly by transforms.
// See https://github.com/observablehq/plot/issues/2271

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function zValueWindow() {
  const random = d3.randomLcg(42);
  const data = d3.sort(
    ["a", "b", "c"].flatMap((type, i) =>
      d3.utcDay
        .range(new Date("2024-01-01"), new Date("2025-01-01"), [1, 7, 30][i])
        .map((date) => ({type, date, value: ((random() * 1000) | 0) + i * 1500}))
    ),
    (d) => d.date
  );
  return Plot.plot({
    y: {grid: true},
    marks: [
      Plot.dot(data, {x: "date", y: "value", fill: "type", r: 1.5}),
      Plot.lineY(
        data,
        Plot.windowY({x: "date", y: "value", stroke: {value: "type"}, k: 10, reduce: "mean", anchor: "end"})
      )
    ]
  });
});

test(function zValueStack() {
  const data = [
    {month: "Jan", revenue: 10, cost: 3, profit: 7},
    {month: "Feb", revenue: 12, cost: 4, profit: 8},
    {month: "Mar", revenue: 15, cost: 5, profit: 10},
    {month: "Apr", revenue: 11, cost: 6, profit: 5}
  ].flatMap((d) => [
    {month: d.month, value: d.revenue, type: "revenue"},
    {month: d.month, value: d.cost, type: "cost"},
    {month: d.month, value: d.profit, type: "profit"}
  ]);
  return Plot.barY(data, Plot.stackY({x: "month", y: "value", fill: {value: "type"}, order: "sum"})).plot({
    color: {domain: ["cost", "profit", "revenue"]}
  });
});

test(async function zValueSelect() {
  const random = d3.randomLcg(42);
  const series = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"];
  const data = series.flatMap((s, k) => d3.range(30).map((i) => ({x: i, y: random() + k * 0.5, series: s})));
  return Plot.plot({
    color: {scheme: "spectral"},
    marks: [
      Plot.line(data, {x: "x", y: "y", stroke: {value: "series"}, strokeOpacity: 0.5}),
      Plot.dot(data, Plot.selectMaxY({x: "x", y: "y", fill: {value: "series"}, r: 4, stroke: "white"}))
    ]
  });
});
