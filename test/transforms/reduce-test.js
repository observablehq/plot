import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("baked-in reducers reduce as expected", test => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(test, data, "deviation", Math.sqrt(10.7));
  testReducer(test, data, "max", 9);
  testReducer(test, data, "mean", 3.5);
  testReducer(test, data, "median", 3);
  testReducer(test, data, "min", 0);
  testReducer(test, data, "sum", 21);
  testReducer(test, data, "variance", 10.7);
});

tape("function reducers reduce as expected", test => {
  const data = [0, 1, 2, 4, 5, 9];
  testReducer(test, data, v => v.length, 6);
  testReducer(test, data, v => v.join(", "), "0, 1, 2, 4, 5, 9");
});

function testReducer(test, data, x, r) {
  const mark = Plot.dot(data, Plot.groupZ({x}, {x: d => d}));
  const c = new Map(mark.initialize().channels);
  test.deepEqual(c.get("x").value, [r]);
}
