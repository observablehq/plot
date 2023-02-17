import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.autoSpec makes a histogram from a quantitative dimension", () => {
  const data = [{value: 1}, {value: 1}, {value: 38}];
  const A = Plot.autoSpec(data, {x: "value"});
  assert.strictEqual(A.y.reduce, "count");
  assert.strictEqual(A.mark, "bar");
});

it("Plot.autoSpec makes a bar chart from an ordinal dimension", () => {
  const data = [{value: "duck"}, {value: "duck"}, {value: "goose"}];
  const A = Plot.autoSpec(data, {x: "value"});
  assert.strictEqual(A.y.reduce, "count");
  assert.strictEqual(A.mark, "bar");
});

it("Plot.autoSpec makes a line from a monotonic dimension", () => {
  const data = [
    {date: 1, value: 1},
    {date: 2, value: 1},
    {date: 3, value: 38}
  ];
  const A = Plot.autoSpec(data, {x: "date", y: "value"});
  assert.strictEqual(A.y.reduce, null);
  assert.strictEqual(A.mark, "line");
});

it("Plot.autoSpec makes a dot plot from two quantitative dimensions", () => {
  const data = [
    {x: 0, y: 0},
    {x: 2, y: 3},
    {x: 1, y: 2}
  ];
  const A = Plot.autoSpec(data, {x: "x", y: "y"});
  assert.strictEqual(A.mark, "dot");
});
