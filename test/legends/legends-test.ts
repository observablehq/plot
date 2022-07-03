import * as Plot from "@observablehq/plot";
import * as assert from "assert";
import it from "../jsdom.js";

it("Plot.legend({color: {type:'identity'}}) returns undefined", () => {
  const l = Plot.legend({color: {type: "identity"}});
  assert.strictEqual(l, undefined);
});

it("Plot.legend({}) throws an error", () => {
  assert.throws(() => Plot.legend({}), /unknown legend type/);
});

it("Plot.legend({color: {}}) throws an error", () => {
  assert.throws(() => Plot.legend({color: {}}), /unknown legend type/);
});
