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

function tickLabels(legend) {
  return Array.from(legend.querySelectorAll("text"), (text) => text.textContent);
}

it(`Plot.legend({color: {type: "quantile"}}) formats the threshold labels`, () => {
  // Quantile scales are implicitly converted to threshold scales, and the
  // thresholds inferred from the data are typically long fractions; the labels
  // are formatted like axis ticks. https://github.com/observablehq/plot/issues/2345
  const legend = Plot.legend({color: {type: "quantile", domain: [0, 1, 2, 3, 4, 5, 6], n: 7}});
  assert.deepStrictEqual(tickLabels(legend), ["0.857", "1.714", "2.571", "3.429", "4.286", "5.143"]);
});

it(`Plot.legend({color: {type: "threshold"}}) formats the threshold labels`, () => {
  const legend = Plot.legend({color: {type: "threshold", domain: [0.5, 1.25, 2000]}});
  assert.deepStrictEqual(tickLabels(legend), ["0.5", "1.25", "2,000"]);
});

it(`Plot.legend({color: {type: "quantile", tickFormat}}) uses the given tick format`, () => {
  const legend = Plot.legend({color: {type: "quantile", domain: [0, 1, 2, 3, 4, 5, 6], n: 7, tickFormat: ",.2f"}});
  assert.deepStrictEqual(tickLabels(legend), ["0.86", "1.71", "2.57", "3.43", "4.29", "5.14"]);
});

it(`Plot.legend({color: {type: "threshold", tickFormat: null}}) suppresses the labels`, () => {
  const legend = Plot.legend({color: {type: "threshold", domain: [0.5, 1.25, 2], tickFormat: null}});
  assert.deepStrictEqual(tickLabels(legend), ["", "", ""]);
});
