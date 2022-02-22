import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.legend({color: {type:'identity'}}) returns undefined", () => {
  const l = Plot.legend({color: {type: "identity"}});
  assert.strictEqual(l, undefined);
});
it("Plot.legend(description) returns undefined if given no scale definition", () => {
  assert.strictEqual(Plot.legend(), undefined);
  assert.strictEqual(Plot.legend({}), undefined);
  assert.strictEqual(Plot.legend({color: {}}), undefined);
});
