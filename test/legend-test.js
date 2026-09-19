import * as Plot from "@observablehq/plot";
import {assert, it} from "vitest";

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

it("Plot.legend({color, symbol}) throws an error when the color and symbol domains don't match", () => {
  assert.throws(
    () => Plot.legend({color: {domain: [1, 2, 3]}, symbol: {domain: [4, 5, 6]}}),
    /the color and symbol scale domains must match/
  );
});

it("Plot.legend({color, symbol}) applies the color scale to the symbol stroke when the domains match", () => {
  const legend = Plot.legend({color: {domain: [1, 2, 3]}, symbol: {domain: [1, 2, 3]}});
  const strokes = [...legend.querySelectorAll("svg")].map((svg) => svg.getAttribute("stroke"));
  assert.deepStrictEqual(strokes, ["#4269d0", "#efb118", "#ff725c"]);
});

it("Plot.legend({color, symbol}) applies the color scale to the symbol stroke when the color domain is a superset", () => {
  const legend = Plot.legend({color: {domain: [1, 2, 3, 4]}, symbol: {domain: [1, 2, 3]}});
  const strokes = [...legend.querySelectorAll("svg")].map((svg) => svg.getAttribute("stroke"));
  assert.deepStrictEqual(strokes, ["#4269d0", "#efb118", "#ff725c"]);
});

it("Plot.legend({symbol}) does not throw when there is no color scale", () => {
  assert.doesNotThrow(() => Plot.legend({symbol: {domain: [1, 2, 3]}}));
});
