/**
 * Returns a function that formats a given month number (from 0 = January to 11
 * = December) according to the specified *locale* and *format*.
 *
 * @param locale a [BCP 47 language tag](https://tools.ietf.org/html/bcp47);
 * defaults to U.S. English.
 * @param format a [month
 * format](https://tc39.es/ecma402/#datetimeformat-objects): either *2-digit*,
 * *numeric*, *narrow*, *short*, *long*; defaults to *short*.
 */
export function formatMonth(
  locale?: string,
  format?: "numeric" | "2-digit" | "long" | "short" | "narrow"
): (i: number) => string;

/**
 * Returns a function that formats a given week day number (from 0 = Sunday to 6
 * = Saturday) according to the specified *locale* and *format*.
 *
 * @param locale a [BCP 47 language tag](https://tools.ietf.org/html/bcp47);
 * defaults to U.S. English.
 * @param format a [weekday
 * format](https://tc39.es/ecma402/#datetimeformat-objects): either *narrow*,
 * *short*, or *long*; defaults to *short*.
 */
export function formatWeekday(locale?: string, format?: "long" | "short" | "narrow"): (i: number) => string;

/**
 * Given a *date*, returns the shortest equivalent ISO 8601 UTC string. If the
 * given *date* is not valid, returns `"Invalid Date"`.
 *
 * @param date a date to format
 */
export function formatIsoDate(date: Date): string;
