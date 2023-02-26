import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.autoSpec makes a histogram from a quantitative dimension", () => {
  const data = [{value: 1}, {value: 1}, {value: 38}];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "value"}), {
    x: {value: "value", reduce: null},
    y: {reduce: "count", zero: true},
    color: {},
    size: {},
    mark: "bar"
  });
});

it("Plot.autoSpec makes a bar chart from an ordinal dimension", () => {
  const data = [{value: "duck"}, {value: "duck"}, {value: "goose"}];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "value", color: "blue"}), {
    x: {value: "value", reduce: null},
    y: {reduce: "count", zero: true},
    color: {color: "blue"},
    size: {},
    mark: "bar"
  });
});

it("Plot.autoSpec makes a line from a monotonic dimension", () => {
  const data = [
    {date: 1, value: 1},
    {date: 2, value: 1},
    {date: 3, value: 38}
  ];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "date", y: "value"}), {
    x: {value: "date", reduce: null},
    y: {value: "value", reduce: null},
    color: {},
    size: {},
    mark: "line"
  });
});

it("Plot.autoSpec makes a dot plot from two quantitative dimensions", () => {
  const data = [
    {x: 0, y: 0},
    {x: 2, y: 3},
    {x: 1, y: 2}
  ];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "x", y: "y"}), {
    x: {value: "x", reduce: null},
    y: {value: "y", reduce: null},
    color: {},
    size: {},
    mark: "dot"
  });
});

it("Plot.autoSpec makes a faceted heatmap", () => {
  const data = [
    {x: 0, y: 0, f: "one"},
    {x: 2, y: 3, f: "one"},
    {x: 1, y: 2, f: "one"},
    {x: 4, y: 1, f: "two"},
    {x: 2, y: 6, f: "two"},
    {x: 4, y: 2, f: "two"}
  ];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "x", y: "y", fy: "f", color: "count"}), {
    x: {value: "x", reduce: null},
    y: {value: "y", reduce: null},
    color: {reduce: "count"},
    size: {},
    fy: "f",
    mark: "bar"
  });
});
