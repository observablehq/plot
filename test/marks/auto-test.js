import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.autoSpec makes a histogram from a quantitative dimension", () => {
  const data = [{value: 1}, {value: 1}, {value: 38}];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "value"}), {
    x: {
      value: Object.assign([1, 1, 38], {label: "value"}),
      reduce: null,
      zero: undefined
    },
    y: {value: undefined, reduce: "count", zero: true},
    color: {value: undefined, color: undefined, reduce: undefined},
    size: {value: undefined, reduce: undefined},
    fx: undefined,
    fy: undefined,
    mark: "bar"
  });
});

it("Plot.autoSpec makes a bar chart from an ordinal dimension", () => {
  const data = [{value: "duck"}, {value: "duck"}, {value: "goose"}];
  assert.deepStrictEqual(Plot.autoSpec(data, {x: "value", color: "blue"}), {
    x: {
      value: Object.assign(["duck", "duck", "goose"], {label: "value"}),
      reduce: null,
      zero: undefined
    },
    y: {value: undefined, reduce: "count", zero: true},
    color: {value: undefined, color: "blue", reduce: undefined},
    size: {value: undefined, reduce: undefined},
    fx: undefined,
    fy: undefined,
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
    x: {value: Object.assign([1, 2, 3], {label: "date"}), reduce: null, zero: undefined},
    y: {
      value: Object.assign([1, 1, 38], {label: "value"}),
      reduce: null,
      zero: undefined
    },
    color: {value: undefined, color: undefined, reduce: undefined},
    size: {value: undefined, reduce: undefined},
    fx: undefined,
    fy: undefined,
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
    x: {value: Object.assign([0, 2, 1], {label: "x"}), reduce: null, zero: undefined},
    y: {value: Object.assign([0, 3, 2], {label: "y"}), reduce: null, zero: undefined},
    color: {value: undefined, color: undefined, reduce: undefined},
    size: {value: undefined, reduce: undefined},
    fx: undefined,
    fy: undefined,
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
    x: {
      value: Object.assign([0, 2, 1, 4, 2, 4], {label: "x"}),
      reduce: null,
      zero: undefined
    },
    y: {
      value: Object.assign([0, 3, 2, 1, 6, 2], {label: "y"}),
      reduce: null,
      zero: undefined
    },
    color: {value: undefined, color: undefined, reduce: "count"},
    size: {value: undefined, reduce: undefined},
    fx: undefined,
    fy: "f",
    mark: "bar"
  });
});
