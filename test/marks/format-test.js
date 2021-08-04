import * as Plot from "@observablehq/plot";
import assert from "assert";

it("formatMonth(locale, format) does the right thing", () => {
  assert.strictEqual(Plot.formatMonth("en", "long")(0), "January");
  assert.strictEqual(Plot.formatMonth("en", "short")(0), "Jan");
  assert.strictEqual(Plot.formatMonth("en", "narrow")(0), "J");
});

// GitHub Actions does not support locales.
it.skip("formatMonth('fr', format) does the right thing", () => {
  assert.strictEqual(Plot.formatMonth("fr", "long")(11), "décembre");
  assert.strictEqual(Plot.formatMonth("fr", "short")(11), "déc.");
  assert.strictEqual(Plot.formatMonth("fr", "narrow")(11), "D");
});

it("formatMonth(locale, format) handles undefined input", () => {
  assert.strictEqual(Plot.formatMonth()(undefined), undefined);
  assert.strictEqual(Plot.formatMonth()(null), undefined);
  assert.strictEqual(Plot.formatMonth()(NaN), undefined);
  assert.strictEqual(Plot.formatMonth()(Infinity), undefined);
  assert.strictEqual(Plot.formatMonth()(1e32), undefined);
});

it("formatMonth(locale) has the expected default", () => {
  assert.strictEqual(Plot.formatMonth("en")(0), "Jan");
  assert.strictEqual(Plot.formatMonth("en", undefined)(0), "Jan");
});

it.skip("formatMonth('fr') has the expected default", () => {
  assert.strictEqual(Plot.formatMonth("fr")(11), "déc.");
  assert.strictEqual(Plot.formatMonth("fr", undefined)(11), "déc.");
});

it("formatMonth() has the expected default", () => {
  assert.strictEqual(Plot.formatMonth()(0), "Jan");
  assert.strictEqual(Plot.formatMonth(undefined, "narrow")(0), "J");
  assert.strictEqual(Plot.formatMonth(undefined, "short")(0), "Jan");
  assert.strictEqual(Plot.formatMonth(undefined, "long")(0), "January");
});

it("formatWeekday(locale, format) does the right thing", () => {
  assert.strictEqual(Plot.formatWeekday("en", "long")(0), "Sunday");
  assert.strictEqual(Plot.formatWeekday("en", "short")(0), "Sun");
  assert.strictEqual(Plot.formatWeekday("en", "narrow")(0), "S");
});

it.skip("formatWeekday('fr', format) does the right thing", () => {
  assert.strictEqual(Plot.formatWeekday("fr", "long")(6), "samedi");
  assert.strictEqual(Plot.formatWeekday("fr", "short")(6), "sam.");
  assert.strictEqual(Plot.formatWeekday("fr", "narrow")(6), "S");
});

it("formatWeekday(locale) has the expected default", () => {
  assert.strictEqual(Plot.formatWeekday("en")(0), "Sun");
  assert.strictEqual(Plot.formatWeekday("en", undefined)(0), "Sun");
});

it.skip("formatWeekday('fr') has the expected default", () => {
  assert.strictEqual(Plot.formatWeekday("fr")(6), "sam.");
  assert.strictEqual(Plot.formatWeekday("fr", undefined)(6), "sam.");
});

it("formatWeekday() has the expected default", () => {
  assert.strictEqual(Plot.formatWeekday()(0), "Sun");
  assert.strictEqual(Plot.formatWeekday(undefined, "narrow")(0), "S");
  assert.strictEqual(Plot.formatWeekday(undefined, "short")(0), "Sun");
  assert.strictEqual(Plot.formatWeekday(undefined, "long")(0), "Sunday");
});

it("formatWeekday() handles undefined input", () => {
  assert.strictEqual(Plot.formatWeekday()(undefined), undefined);
  assert.strictEqual(Plot.formatWeekday()(null), undefined);
  assert.strictEqual(Plot.formatWeekday()(NaN), undefined);
  assert.strictEqual(Plot.formatWeekday()(Infinity), undefined);
  assert.strictEqual(Plot.formatWeekday()(1e32), undefined);
});
