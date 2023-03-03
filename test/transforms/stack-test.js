import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.stack returns the expected values", () => {
  const y = [1, 2, -2, -1];
  const {
    channels: {
      y1: {value: Y1},
      y2: {value: Y2}
    }
  } = Plot.barY(y, Plot.stackY({y})).initialize();
  assert.deepStrictEqual(y, [1, 2, -2, -1]);
  assert.deepStrictEqual(Y1, Float64Array.of(0, 1, 0, -2));
  assert.deepStrictEqual(Y2, Float64Array.of(1, 3, -2, -3));
});
