import {assert, it} from "vitest";
import * as Plot from "@observablehq/plot";

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

for (const axis of ["x", "y"]) {
  it(`Plot.normalize${axis.toUpperCase()} deviation preserves missing values`, () => {
    testNormalize([2, 2, NaN, undefined, null], "deviation", [0, 0, NaN, NaN, NaN], axis);
    testNormalize([NaN, undefined, null], "deviation", [NaN, NaN, NaN], axis);
    testNormalize([NaN, 2, undefined, null], "deviation", [NaN, 0, NaN, NaN], axis);
    testNormalize([2, 4, NaN, undefined, null], "deviation", [-1 / Math.SQRT2, 1 / Math.SQRT2, NaN, NaN, NaN], axis);
  });

  it(`Plot.normalize${axis.toUpperCase()} deviation preserves missing values in grouped constant series`, () => {
    testNormalize([2, NaN, 10, undefined, 2, 10, null], "deviation", [0, NaN, 0, NaN, 0, 0, NaN], axis, {
      z: ["a", "a", "b", "b", "a", "b", "b"]
    });
  });
}

function testNormalize(data, basis, r, axis = "y", options = {}) {
  const normalize = axis === "x" ? Plot.normalizeX : Plot.normalizeY;
  const mark = Plot.dot(data, normalize(basis, {...options, [axis]: data}));
  const {
    channels: {
      [axis]: {value: Y}
    }
  } = mark.initialize();
  assert.deepStrictEqual(Y, r);
}
