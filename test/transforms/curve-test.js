import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.line rejects an invalid curve", () => {
  assert.throws(() => Plot.lineY([], {y: 1, curve: "neo"}), /^Error: unknown curve: neo$/);
  assert.throws(() => Plot.lineY([], {y: 1, curve: 42}), /^Error: unknown curve: 42$/);
});

it("Plot.line accepts the explicit auto curve", () => {
  assert.strictEqual(Plot.lineY([], {y: 1, curve: "auto"}).curve?.name, "curveAuto");
});
