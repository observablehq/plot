import {assert, it} from "vitest";
import * as Plot from "@observablehq/plot";

it("dodgeY throws on non-positive constant r", () => {
  assert.throws(() => Plot.dot([1, 2, 3], Plot.dodgeY({x: Plot.identity, r: -1})).plot(), /invalid dodge radius/);
  assert.throws(() => Plot.dot([1, 2, 3], Plot.dodgeY({x: Plot.identity, r: 0})).plot(), /invalid dodge radius/);
});

it("dodgeX throws on non-positive constant r", () => {
  assert.throws(() => Plot.dot([1, 2, 3], Plot.dodgeX({y: Plot.identity, r: -1})).plot(), /invalid dodge radius/);
});
