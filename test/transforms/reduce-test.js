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
  testReducer(data, "mode", 0);
});

it("baked-in non-numeric reducers throw on non-numeric data", () => {
  const data = ["A", "B", "C", "B"];
  testReducer(data, "min", "A");
  testReducer(data, "max", "C");
  testReducer(data, "mode", "B");
});

it("function reducers reduce as expected", () => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(data, (v) => v.length, 6);
  testReducer(data, (v) => v.join(", "), "0, 1, 2, 4, 5, 9");
});

it.only("baked-in numeric reducers throw on non-numeric data", () => {
  const data = [null, "A", 1, 2, 3];
  testReducerThrows(data, "deviation");
  testReducerThrows(data, "mean");
  testReducerThrows(data, "median");
  testReducerThrows(data, "sum");
  testReducerThrows(data, "variance");
});

it("baked-in numeric reducers accept and return temporal data", () => {
  const data = [null, new Date(2001, 0, 1), new Date(2002, 0, 3), 0];
  testReducer(data, "mean", new Date("1991-01-01T23:20:00.000Z"));
  testReducer(data, "median", new Date("2000-12-31T23:00:00.000Z"));
});

it("baked-in numeric reducers accept temporal data", () => {
  const data = [null, new Date(2001, 0, 1), new Date(2002, 0, 2)];
  testReducer(data, "deviation", 22360413477.393482);
  testReducer(data, "sum", 1988229600000);
  testReducer(data, "variance", 499988090880000000000);
});

function testReducer(data, x, r) {
  const mark = Plot.dot(data, Plot.groupZ({x}, {x: data}));
  const {
    channels: {
      x: {value: X}
    }
  } = mark.initialize();
  assert.deepStrictEqual(X, [r]);
}

function testReducerThrows(data, x) {
  const mark = Plot.dot(data, Plot.groupZ({x}, {x: data}));
  assert.throws(() => mark.initialize());
}
