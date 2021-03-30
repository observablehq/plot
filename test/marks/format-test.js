import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("formatMonth(locale, format) does the right thing", test => {
  test.equal(Plot.formatMonth("en", "long")(0), "January");
  test.equal(Plot.formatMonth("en", "short")(0), "Jan");
  test.equal(Plot.formatMonth("en", "narrow")(0), "J");
  test.equal(Plot.formatMonth("fr", "long")(11), "décembre");
  test.equal(Plot.formatMonth("fr", "short")(11), "déc.");
  test.equal(Plot.formatMonth("fr", "narrow")(11), "D");
});

tape("formatMonth(locale, format) handles undefined input", test => {
  test.equal(Plot.formatMonth()(undefined), undefined);
  test.equal(Plot.formatMonth()(null), undefined);
  test.equal(Plot.formatMonth()(NaN), undefined);
  test.equal(Plot.formatMonth()(Infinity), undefined);
  test.equal(Plot.formatMonth()(1e32), undefined);
});

tape("formatMonth(locale) has the expected default", test => {
  test.equal(Plot.formatMonth("en")(0), "Jan");
  test.equal(Plot.formatMonth("fr")(11), "déc.");
  test.equal(Plot.formatMonth("en", undefined)(0), "Jan");
  test.equal(Plot.formatMonth("fr", undefined)(11), "déc.");
});

tape("formatMonth() has the expected default", test => {
  test.equal(Plot.formatMonth()(0), "Jan");
  test.equal(Plot.formatMonth(undefined, "narrow")(0), "J");
  test.equal(Plot.formatMonth(undefined, "short")(0), "Jan");
  test.equal(Plot.formatMonth(undefined, "long")(0), "January");
});

tape("formatWeekday(locale, format) does the right thing", test => {
  test.equal(Plot.formatWeekday("en", "long")(0), "Sunday");
  test.equal(Plot.formatWeekday("en", "short")(0), "Sun");
  test.equal(Plot.formatWeekday("en", "narrow")(0), "S");
  test.equal(Plot.formatWeekday("fr", "long")(6), "samedi");
  test.equal(Plot.formatWeekday("fr", "short")(6), "sam.");
  test.equal(Plot.formatWeekday("fr", "narrow")(6), "S");
});

tape("formatWeekday(locale) has the expected default", test => {
  test.equal(Plot.formatWeekday("en")(0), "Sun");
  test.equal(Plot.formatWeekday("fr")(6), "sam.");
  test.equal(Plot.formatWeekday("en", undefined)(0), "Sun");
  test.equal(Plot.formatWeekday("fr", undefined)(6), "sam.");
});

tape("formatWeekday() has the expected default", test => {
  test.equal(Plot.formatWeekday()(0), "Sun");
  test.equal(Plot.formatWeekday(undefined, "narrow")(0), "S");
  test.equal(Plot.formatWeekday(undefined, "short")(0), "Sun");
  test.equal(Plot.formatWeekday(undefined, "long")(0), "Sunday");
});

tape("formatWeekday() handles undefined input", test => {
  test.equal(Plot.formatWeekday()(undefined), undefined);
  test.equal(Plot.formatWeekday()(null), undefined);
  test.equal(Plot.formatWeekday()(NaN), undefined);
  test.equal(Plot.formatWeekday()(Infinity), undefined);
  test.equal(Plot.formatWeekday()(1e32), undefined);
});
