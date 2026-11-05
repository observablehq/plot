import * as Plot from "@observablehq/plot";
import {assert, it} from "vitest";

it("waffle accepts a numeric or auto unit", () => {
  assert.strictEqual(Plot.waffleY([1]).unit, "auto");
  assert.strictEqual(Plot.waffleY([1], {unit: 10}).unit, 10);
  assert.strictEqual(Plot.waffleY([1], {unit: "10"}).unit, 10);
  assert.strictEqual(Plot.waffleX([1], {unit: "Auto"}).unit, "auto");
});

it("waffle rejects an invalid unit", () => {
  for (const unit of [0, -1, Infinity, NaN, "foo"]) {
    assert.throws(() => Plot.waffleY([1], {unit}), /invalid unit/);
  }
});
