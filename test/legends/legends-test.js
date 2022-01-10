import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.legend({color: {type:'identity'}}) returns undefined", () => {
  const l = Plot.legend({color: {type: "identity"}});
  assert.strictEqual(l, undefined);
});
