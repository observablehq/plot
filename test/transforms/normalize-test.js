import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.normalize first", () => {
  testNormalize([1, 2, 4, 5], "first", [1, 2, 4, 5]);
});

it("Plot.normalize last", () => {
  testNormalize([1, 2, 4, 5], "last", [0.2, 0.4, 0.8, 1]);
});

it("Plot.normalize mean", () => {
  testNormalize([0, 4, 8, 4], "mean", [0, 1, 2, 1]);
});

it("Plot.normalize median", () => {
  testNormalize([1, 2, 6, 6], "median", [0.25, 0.5, 1.5, 1.5]);
});

it("Plot.normalize min", () => {
  testNormalize([10, 6, 2], "min", [5, 3, 1]);
});

it("Plot.normalize max", () => {
  testNormalize([10, 6, 2], "max", [1, 0.6, 0.2]);
});

it("Plot.normalize sum", () => {
  testNormalize([1, 1, 6, 2], "sum", [0.1, 0.1, 0.6, 0.2]);
});

it("Plot.normalize extent", () => {
  testNormalize([1, 2, 3], "extent", [0, 0.5, 1]);
});

it("Plot.normalize deviation", () => {
  testNormalize([1, 2, 3], "deviation", [-1, 0, 1]);
});

it("Plot.normalize deviation doesn’t crash on equal values", () => {
  testNormalize([1, 1], "deviation", [0, 0]);
});

function testNormalize(data, basis, r) {
  const mark = Plot.dot(data, Plot.normalizeY(basis, {y: data}));
  const {
    channels: {
      y: {value: Y}
    }
  } = mark.initialize();
  assert.deepStrictEqual(Y, r);
}
