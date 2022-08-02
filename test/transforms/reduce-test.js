import * as Plot from "@observablehq/plot";
import assert from "assert";

it("baked-in reducers reduce as expected", () => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(data, "deviation", Math.sqrt(10.7));
  testReducer(data, "max", 9);
  testReducer(data, "mean", 3.5);
  testReducer(data, "median", 3);
  testReducer(data, "min", 0);
  testReducer(data, "sum", 21);
  testReducer(data, "variance", 10.7);
});

it("function reducers reduce as expected", () => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(data, (v) => v.length, 6);
  testReducer(data, (v) => v.join(", "), "0, 1, 2, 4, 5, 9");
});

function testReducer(data, x, r) {
  const mark = Plot.dot(data, Plot.groupZ({x}, {x: (d) => d}));
  const {
    channels: {
      x: {value: X}
    }
  } = mark.initialize();
  assert.deepStrictEqual(X, [r]);
}
