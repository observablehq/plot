import * as Plot from "@observablehq/plot";
import assert from "assert";
import {parseIsoDate} from "../../src/format.js";

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

it("formatIsoDate returns the expected value for years", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(1999, 0, 1))), "1999");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1))), "2001");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2020, 0, 1))), "2020");
});

it("formatIsoDate returns the expected value for months", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(1999, 1, 1))), "1999-02");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 2, 1))), "2001-03");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2020, 3, 1))), "2020-04");
});

it("formatIsoDate returns the expected value for years in the distant past", () => {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(0); // JavaScript derp
  assert.strictEqual(Plot.formatIsoDate(d), "0000");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(-20, 0, 1))), "-000020");
});

it("formatIsoDate returns the expected value for years in the distant future", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(20000, 0, 1))), "+020000");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(100000, 0, 1))), "+100000");
});

it("formatIsoDate returns the expected value for days", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 2))), "2001-01-02");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 3))), "2001-02-03");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21))), "2001-10-21");
});

it("formatIsoDate returns the expected value for hours and minutes", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1, 0, 1))), "2001-01-01T00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 2, 0, 1))), "2001-02-02T00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21, 0, 1))), "2001-10-21T00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1, 1, 0))), "2001-01-01T01:00Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 2, 1, 0))), "2001-02-02T01:00Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21, 1, 0))), "2001-10-21T01:00Z");
});

it("formatIsoDate returns the expected value for seconds", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1, 0, 0, 1))), "2001-01-01T00:00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 2, 0, 0, 1))), "2001-02-02T00:00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21, 0, 0, 1))), "2001-10-21T00:00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1, 1, 0, 1))), "2001-01-01T01:00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 2, 1, 0, 1))), "2001-02-02T01:00:01Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21, 1, 0, 1))), "2001-10-21T01:00:01Z");
});

it("formatIsoDate returns the expected value for milliseconds", () => {
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 123))), "2001-01-01T00:00:00.123Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 2, 0, 0, 0, 123))), "2001-02-02T00:00:00.123Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21, 0, 0, 0, 123))), "2001-10-21T00:00:00.123Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 0, 1, 1, 0, 1, 123))), "2001-01-01T01:00:01.123Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 1, 2, 1, 0, 1, 123))), "2001-02-02T01:00:01.123Z");
  assert.strictEqual(Plot.formatIsoDate(new Date(Date.UTC(2001, 9, 21, 1, 0, 1, 123))), "2001-10-21T01:00:01.123Z");
});

it("formatIsoDate accepts a number as well as a Date", () => {
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(2020, 0, 1)), "2020");
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(-20, 0, 1)), "-000020");
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(100000, 0, 1)), "+100000");
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(2001, 9, 21)), "2001-10-21");
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(2001, 9, 21, 1, 0)), "2001-10-21T01:00Z");
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(2001, 9, 21, 1, 0, 1)), "2001-10-21T01:00:01Z");
  assert.strictEqual(Plot.formatIsoDate(Date.UTC(2001, 9, 21, 1, 0, 1, 123)), "2001-10-21T01:00:01.123Z");
});

it("formatIsoDate coerces the input to a number, and then a Date, if needed", () => {
  assert.strictEqual(Plot.formatIsoDate({valueOf: () => Date.UTC(2020, 0, 1)}), "2020");
});

it("formatIsoDate returns 'Invalid Date' for noncompliant input", () => {
  assert.strictEqual(Plot.formatIsoDate(NaN), "Invalid Date");
  assert.strictEqual(Plot.formatIsoDate(new Date(NaN)), "Invalid Date");
});

it("parseIsoDate returns the expected value for years", () => {
  assert.deepStrictEqual(parseIsoDate("1999"), new Date(Date.UTC(1999, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001"), new Date(Date.UTC(2001, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2020"), new Date(Date.UTC(2020, 0, 1)));
});

it("parseIsoDate returns the expected value for years and months", () => {
  assert.deepStrictEqual(parseIsoDate("1999-01"), new Date(Date.UTC(1999, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-02"), new Date(Date.UTC(2001, 1, 1)));
  assert.deepStrictEqual(parseIsoDate("2020-03"), new Date(Date.UTC(2020, 2, 1)));
});

it("parseIsoDate returns the expected value for years, months, and dates", () => {
  assert.deepStrictEqual(parseIsoDate("1999-01-01"), new Date(Date.UTC(1999, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-02-03"), new Date(Date.UTC(2001, 1, 3)));
  assert.deepStrictEqual(parseIsoDate("2020-04-05"), new Date(Date.UTC(2020, 3, 5)));
});

it("parseIsoDate returns the expected value for years in the distant past", () => {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(0); // JavaScript derp
  assert.deepStrictEqual(parseIsoDate("0000"), d);
  assert.deepStrictEqual(parseIsoDate("0000-01"), d);
  assert.deepStrictEqual(parseIsoDate("0000-01-01"), d);
  assert.deepStrictEqual(parseIsoDate("-000020"), new Date(Date.UTC(-20, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("-000020-01"), new Date(Date.UTC(-20, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("-000020-01-01"), new Date(Date.UTC(-20, 0, 1)));
});

it("parseIsoDate returns the expected value for years in the distant future", () => {
  assert.deepStrictEqual(parseIsoDate("+020000"), new Date(Date.UTC(20000, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("+020000-01"), new Date(Date.UTC(20000, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("+020000-01-01"), new Date(Date.UTC(20000, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("+100000"), new Date(Date.UTC(100000, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("+100000-01"), new Date(Date.UTC(100000, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("+100000-01-01"), new Date(Date.UTC(100000, 0, 1)));
});

it("parseIsoDate returns the expected value for hours and minutes", () => {
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:01Z"), new Date(Date.UTC(2001, 0, 1, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-02-02T00:01Z"), new Date(Date.UTC(2001, 1, 2, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-10-21T00:01Z"), new Date(Date.UTC(2001, 9, 21, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T01:00Z"), new Date(Date.UTC(2001, 0, 1, 1, 0)));
  assert.deepStrictEqual(parseIsoDate("2001-02-02T01:00Z"), new Date(Date.UTC(2001, 1, 2, 1, 0)));
  assert.deepStrictEqual(parseIsoDate("2001-10-21T01:00Z"), new Date(Date.UTC(2001, 9, 21, 1, 0)));
});

it("parseIsoDate returns the expected value for seconds", () => {
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:01Z"), new Date(Date.UTC(2001, 0, 1, 0, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-02-02T00:00:01Z"), new Date(Date.UTC(2001, 1, 2, 0, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-10-21T00:00:01Z"), new Date(Date.UTC(2001, 9, 21, 0, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T01:00:01Z"), new Date(Date.UTC(2001, 0, 1, 1, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-02-02T01:00:01Z"), new Date(Date.UTC(2001, 1, 2, 1, 0, 1)));
  assert.deepStrictEqual(parseIsoDate("2001-10-21T01:00:01Z"), new Date(Date.UTC(2001, 9, 21, 1, 0, 1)));
});

it("parseIsoDate returns the expected value for milliseconds", () => {
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123Z"), new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-02-02T00:00:00.123Z"), new Date(Date.UTC(2001, 1, 2, 0, 0, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-10-21T00:00:00.123Z"), new Date(Date.UTC(2001, 9, 21, 0, 0, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T01:00:01.123Z"), new Date(Date.UTC(2001, 0, 1, 1, 0, 1, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-02-02T01:00:01.123Z"), new Date(Date.UTC(2001, 1, 2, 1, 0, 1, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-10-21T01:00:01.123Z"), new Date(Date.UTC(2001, 9, 21, 1, 0, 1, 123)));
});

// prettier-ignore
it("parseIsoDate returns the expected value for various timezones", () => {
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123+0000"), new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123+00:00"), new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123+0130"), new Date(Date.UTC(2000, 11, 31, 22, 30, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123+01:30"), new Date(Date.UTC(2000, 11, 31, 22, 30, 0, 123)));
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123-0000"), new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 123))); // RFC 3339, but not ISO 8601
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123-00:00"), new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 123))); // RFC 3339, but not ISO 8601
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123-0130"), new Date(Date.UTC(2001, 0, 1, 1, 30, 0, 123))); // RFC 3339, but not ISO 8601
  assert.deepStrictEqual(parseIsoDate("2001-01-01T00:00:00.123-01:30"), new Date(Date.UTC(2001, 0, 1, 1, 30, 0, 123))); // RFC 3339, but not ISO 8601
});

it("parseIsoDate returns undefined for noncompliant input", () => {
  assert.strictEqual(parseIsoDate("2001-01-01T00:00:00.123+00"), undefined); // ISO 8601, but not Chrome or Node
  assert.strictEqual(parseIsoDate("2001-01-01T00:00:00.123-01"), undefined); // ISO 8601, but not Chrome or Node
  assert.strictEqual(parseIsoDate("2001-01-01 00:00:00.123Z"), undefined); // RFC 3339, but not ISO 8601
  assert.strictEqual(parseIsoDate("2001-01-01t00:00:00.123Z"), undefined); // RFC 3339, but not ISO 8601
  assert.strictEqual(parseIsoDate("2021-W36"), undefined); // ISO 8601 week
  assert.strictEqual(parseIsoDate("2021-W36-1"), undefined); // ISO 8601 week with weekday
  assert.strictEqual(parseIsoDate("--09-06"), undefined); // ISO 8601 date without year
  assert.strictEqual(parseIsoDate("2021-249"), undefined); // ISO 8601 ordinal date
});
