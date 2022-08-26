/* eslint-disable @typescript-eslint/no-explicit-any */
import {format as isoFormat} from "isoformat";
import {string} from "./options.js";
import {memoize1} from "./memoize.js";

const numberFormat = memoize1<Intl.NumberFormat>(
  (locale: string | string[] | undefined) => new Intl.NumberFormat(locale)
);
const monthFormat = memoize1<Intl.DateTimeFormat>(
  (locale: string | string[] | undefined, month: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined) =>
    new Intl.DateTimeFormat(locale, {timeZone: "UTC", ...(month && {month})})
);
const weekdayFormat = memoize1<Intl.DateTimeFormat>(
  (locale: string | string[] | undefined, weekday: "long" | "short" | "narrow" | undefined) =>
    new Intl.DateTimeFormat(locale, {timeZone: "UTC", ...(weekday && {weekday})})
);

export function formatNumber(locale = "en-US"): (value: any) => string | undefined {
  const format = numberFormat(locale);
  return (i: any) => (i != null && !isNaN(i) ? format.format(i) : undefined);
}

/**
 * ```js
 * Plot.formatMonth("es-MX", "long")(0) // "enero"
 * ```
 *
 * Returns a function that formats a given month number (from 0 = January to 11
 * = December) according to the specified *locale* and *format*. The *locale* is
 * a [BCP 47 language tag](https://tools.ietf.org/html/bcp47) and defaults to
 * U.S. English. The *format* is a [month
 * format](https://tc39.es/ecma402/#datetimeformat-objects): either *2-digit*,
 * *numeric*, *narrow*, *short*, *long*; if not specified, it defaults to
 * *short*.
 */
export function formatMonth(
  locale = "en-US",
  format: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined = "short"
) {
  const fmt = monthFormat(locale, format);
  return (i: Date | number | null | undefined) =>
    i != null && !isNaN((i = +new Date(Date.UTC(2000, +i)))) ? fmt.format(i) : undefined;
}

/**
 * ```js
 * Plot.formatWeekday("es-MX", "long")(0) // "domingo"
 * ```
 *
 * Returns a function that formats a given week day number (from 0 = Sunday to 6
 * = Saturday) according to the specified *locale* and *format*. The *locale* is
 * a [BCP 47 language tag](https://tools.ietf.org/html/bcp47) and defaults to
 * U.S. English. The *format* is a [weekday
 * format](https://tc39.es/ecma402/#datetimeformat-objects): either *narrow*,
 * *short*, or *long*; if not specified, it defaults to *short*.
 */
export function formatWeekday(locale = "en-US", format: "long" | "short" | "narrow" | undefined = "short") {
  const fmt = weekdayFormat(locale, format);
  return (i: Date | number | null | undefined) =>
    i != null && !isNaN((i = +new Date(Date.UTC(2001, 0, +i)))) ? fmt.format(i) : undefined;
}

/**
 * ```js
 * Plot.formatIsoDate(new Date("2020-01-01T00:00.000Z")) // "2020-01-01"
 * ```
 *
 * Given a *date*, returns the shortest equivalent ISO 8601 UTC string. If the
 * given *date* is not valid, returns `"Invalid Date"`.
 */
export function formatIsoDate(date: Date): string {
  return isoFormat(date, "Invalid Date");
}

export function formatAuto(locale = "en-US"): (value: any) => string | number | undefined {
  const number = formatNumber(locale);
  return (v: any) => (v instanceof Date ? formatIsoDate : typeof v === "number" ? number : string)(v);
}

// TODO When Plot supports a top-level locale option, this should be removed
// because it lacks context to know which locale to use; formatAuto should be
// used instead whenever possible.
export const formatDefault = formatAuto();
