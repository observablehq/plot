import * as Plot from "@observablehq/plot";
import assert from "assert";

it("stackY(options) returns the expected values", () => {
  const y = [1, 2, -2, -1];
  const {
    channels: {
      y1: {value: Y1},
      y2: {value: Y2}
    }
  } = (Plot.barY(y, Plot.stackY({y})) as any).initialize();
  assert.deepStrictEqual(y, [1, 2, -2, -1]);
  assert.deepStrictEqual(Y1, Float64Array.of(0, 1, 0, -2));
  assert.deepStrictEqual(Y2, Float64Array.of(1, 3, -2, -3));
});

it("stackY({order}) rejects an invalid order", () => {
  assert.throws(() => Plot.barY([], {y: 1, order: 42 as any}), /^Error: invalid order: 42$/);
});
