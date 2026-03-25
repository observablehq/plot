import * as Plot from "@observablehq/plot";
import * as assert from "assert";
import it from "./jsdom.js";

it(`Plot.legend({color: {type: "identity"}}) returns undefined`, () => {
  assert.strictEqual(Plot.legend({color: {type: "identity"}}), undefined);
});

it(`Plot.legend({legend: "swatches", color: {type: "<not-ordinal>"}}) throws an error`, () => {
  assert.throws(() => Plot.legend({legend: "swatches", color: {type: "linear"}}), /swatches legend requires ordinal/);
  assert.throws(() => Plot.legend({legend: "swatches", color: {type: "linear"}}), /\(not linear\)/);
  assert.throws(
    () => Plot.legend({legend: "swatches", color: {type: "diverging"}}),
    /swatches legend requires ordinal/
  );
  assert.throws(() => Plot.legend({legend: "swatches", color: {type: "diverging"}}), /\(not diverging\)/);
});

it("Plot.legend({}) throws an error", () => {
  assert.throws(() => Plot.legend({}), /unknown legend type/);
});

it("Plot.legend({color: {}}) throws an error", () => {
  assert.throws(() => Plot.legend({color: {}}), /unknown legend type/);
});

it("Plot.legend({... locale}) localizes swatch labels", () => {
  const legend = Plot.legend({
    locale: "fr",
    color: {type: "ordinal", domain: [12345], range: ["red"]},
    legend: "swatches"
  });
  assert.ok(legend.textContent.includes("12\u202f345"));
});
