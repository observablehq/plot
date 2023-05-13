import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.autoSpec makes a histogram from a quantitative dimension", () => {
  const data = [{value: 1}, {value: 1}, {value: 38}];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "value"}), {
    fx: null,
    fy: null,
    x: {value: "value", reduce: null, zero: false},
    y: {value: null, reduce: "count", zero: true},
    color: {value: null, reduce: null},
    size: {value: null, reduce: null},
    mark: "bar",
    markImpl: "rectY",
    markOptions: {
      fx: undefined,
      fy: undefined,
      x: {value: Object.assign([1, 1, 38], {label: "value"})},
      y: undefined,
      fill: undefined,
      z: undefined,
      r: undefined
    },
    transformImpl: "binX",
    transformOptions: {fill: undefined, r: undefined, y: "count"},
    colorMode: "fill"
  });
});

it("Plot.autoSpec makes a bar chart from an ordinal dimension", () => {
  const data = [{value: "duck"}, {value: "duck"}, {value: "goose"}];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "value", color: "blue"}), {
    fx: null,
    fy: null,
    x: {value: "value", reduce: null, zero: false},
    y: {value: null, reduce: "count", zero: true},
    color: {value: null, reduce: null, color: "blue"},
    size: {value: null, reduce: null},
    mark: "bar",
    markImpl: "barY",
    markOptions: {
      fx: undefined,
      fy: undefined,
      x: Object.assign(["duck", "duck", "goose"], {label: "value"}),
      y: undefined,
      fill: "blue",
      z: undefined,
      r: undefined
    },
    transformImpl: "groupX",
    transformOptions: {fill: undefined, r: undefined, y: "count"},
    colorMode: "fill"
  });
});

it("Plot.autoSpec makes a line from a monotonic dimension", () => {
  const data = [
    {date: 1, value: 1},
    {date: 2, value: 1},
    {date: 3, value: 38}
  ];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "date", y: "value"}), {
    fx: null,
    fy: null,
    x: {value: "date", reduce: null, zero: false},
    y: {value: "value", reduce: null, zero: false},
    color: {value: null, reduce: null},
    size: {value: null, reduce: null},
    mark: "line",
    markImpl: "line",
    markOptions: {
      fx: undefined,
      fy: undefined,
      x: Object.assign([1, 2, 3], {label: "date"}),
      y: Object.assign([1, 1, 38], {label: "value"}),
      stroke: undefined,
      z: undefined,
      r: undefined
    },
    transformImpl: undefined,
    transformOptions: {stroke: undefined, r: undefined},
    colorMode: "stroke"
  });
});

it("Plot.autoSpec makes a dot plot from two quantitative dimensions", () => {
  const data = [
    {x: 0, y: 0},
    {x: 2, y: 3},
    {x: 1, y: 2}
  ];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "x", y: "y"}), {
    fx: null,
    fy: null,
    x: {value: "x", reduce: null, zero: false},
    y: {value: "y", reduce: null, zero: false},
    color: {value: null, reduce: null},
    size: {value: null, reduce: null},
    mark: "dot",
    markImpl: "dot",
    markOptions: {
      fx: undefined,
      fy: undefined,
      x: Object.assign([0, 2, 1], {label: "x"}),
      y: Object.assign([0, 3, 2], {label: "y"}),
      stroke: undefined,
      z: undefined,
      r: undefined
    },
    transformImpl: undefined,
    transformOptions: {stroke: undefined, r: undefined},
    colorMode: "stroke"
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
    fx: null,
    fy: "f",
    x: {value: "x", reduce: null, zero: false},
    y: {value: "y", reduce: null, zero: false},
    color: {value: null, reduce: "count"},
    size: {value: null, reduce: null},
    mark: "bar",
    markImpl: "rectY",
    markOptions: {
      fx: undefined,
      fy: "f",
      x: {value: Object.assign([0, 2, 1, 4, 2, 4], {label: "x"})},
      y: {value: Object.assign([0, 3, 2, 1, 6, 2], {label: "y"})},
      fill: undefined,
      z: undefined,
      r: undefined
    },
    transformImpl: "bin",
    transformOptions: {fill: "count", r: undefined},
    colorMode: "fill"
  });
});
