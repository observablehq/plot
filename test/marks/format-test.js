import * as Plot from "@observablehq/plot";
import {formatYear, isYearDomain} from "../../src/format.js";
import {inferTickFormat} from "../../src/marks/axis.js";
import assert from "assert";

it("formatNumber(locale) does the right thing", () => {
  assert.strictEqual(Plot.formatNumber()(Math.PI), "3.142");
  assert.strictEqual(Plot.formatNumber()(12345), "12,345");
  assert.strictEqual(Plot.formatNumber("en")(Math.PI), "3.142");
  assert.strictEqual(Plot.formatNumber("en")(12345), "12,345");
  assert.strictEqual(Plot.formatNumber("fr")(Math.PI), "3,142");
  assert.strictEqual(Plot.formatNumber("fr")(12345), "12\u202f345");
});

it("formatMonth(locale, format) does the right thing", () => {
  assert.strictEqual(Plot.formatMonth("en", "long")(0), "January");
  assert.strictEqual(Plot.formatMonth("en", "short")(0), "Jan");
  assert.strictEqual(Plot.formatMonth("en", "narrow")(0), "J");
});

it("formatMonth('fr', format) does the right thing", () => {
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

it("formatMonth('fr') has the expected default", () => {
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

it("formatYear formats numbers in [0, 10000) without commas", () => {
  assert.strictEqual(formatYear(2000), "2000");
  assert.strictEqual(formatYear(2020), "2020");
  assert.strictEqual(formatYear(0), "0");
  assert.strictEqual(formatYear(9999), "9999");
  assert.strictEqual(formatYear(2023.56), "2023.56");
  assert.strictEqual(formatYear(2023.5678901234), "2023.568");
});

it("formatYear falls back to formatNumber for other values", () => {
  assert.strictEqual(formatYear(10000), "10,000");
  assert.strictEqual(formatYear(-1), "-1");
  assert.strictEqual(formatYear(NaN), "NaN");
  assert.strictEqual(formatYear(Infinity), "∞");
});

it("isYearDomain returns true for year-like integer domains", () => {
  assert.strictEqual(isYearDomain([2000, 2020]), true);
  assert.strictEqual(isYearDomain([1000, 3000]), true);
  assert.strictEqual(isYearDomain([1990, null, 2020]), true);
  assert.strictEqual(isYearDomain([1990, NaN, 2020]), true);
});

it("tickFormat 'year' opts into year formatting", () => {
  const scale = {type: "linear", domain: () => [0, 100]};
  assert.strictEqual(inferTickFormat(scale, [0, 100], null, "year"), formatYear);
  assert.strictEqual(inferTickFormat(scale, [0, 100], null, "Year"), formatYear);
  assert.strictEqual(inferTickFormat(scale, [0, 100], null, "YEAR"), formatYear);
});

it("tickFormat 'year' on temporal data uses %Y", () => {
  const dates = [new Date("2020-01-01"), new Date("2025-01-01")];
  const scale = {type: "utc", domain: () => dates};
  const fmt = inferTickFormat(scale, dates, null, "year");
  assert.strictEqual(fmt(new Date("2023-06-15")), "2023");
});

it("isYearDomain returns false for non-year domains", () => {
  assert.strictEqual(isYearDomain([0, 100]), false);
  assert.strictEqual(isYearDomain([999, 2000]), false);
  assert.strictEqual(isYearDomain([2000, 3001]), false);
  assert.strictEqual(isYearDomain([10000, 20000]), false);
  assert.strictEqual(isYearDomain([-1, 100]), false);
  assert.strictEqual(isYearDomain([2000.5, 2001.5]), false);
  assert.strictEqual(isYearDomain(["a", "b"]), false);
  assert.strictEqual(isYearDomain(["2000", 2020]), false);
  assert.strictEqual(isYearDomain([]), false);
  assert.strictEqual(isYearDomain([null, undefined]), false);
});
