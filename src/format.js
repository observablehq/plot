import {format as isoFormat} from "isoformat";
import {string} from "./options.js";
import {memoize1} from "./memoize.js";

const numberFormat = memoize1((locale) => {
  return new Intl.NumberFormat(locale);
});

const monthFormat = memoize1((locale, month) => {
  return new Intl.DateTimeFormat(locale, {timeZone: "UTC", ...(month && {month})});
});

const weekdayFormat = memoize1((locale, weekday) => {
  return new Intl.DateTimeFormat(locale, {timeZone: "UTC", ...(weekday && {weekday})});
});

export function formatNumber(locale = "en-US") {
  const format = numberFormat(locale);
  return (i) => (i != null && !isNaN(i) ? format.format(i) : undefined);
}

export function formatMonth(locale = "en-US", format = "short") {
  const fmt = monthFormat(locale, format);
  return (i) => (i != null && !isNaN((i = +new Date(Date.UTC(2000, +i)))) ? fmt.format(i) : undefined);
}

export function formatWeekday(locale = "en-US", format = "short") {
  const fmt = weekdayFormat(locale, format);
  return (i) => (i != null && !isNaN((i = +new Date(Date.UTC(2001, 0, +i)))) ? fmt.format(i) : undefined);
}

export function formatIsoDate(date) {
  return isoFormat(date, "Invalid Date");
}

export function formatAuto(locale = "en-US") {
  const number = formatNumber(locale);
  return (v) => (v instanceof Date ? formatIsoDate : typeof v === "number" ? number : string)(v);
}

// TODO When Plot supports a top-level locale option, this should be removed
// because it lacks context to know which locale to use; formatAuto should be
// used instead whenever possible.
export const formatDefault = formatAuto();

// Formats a number as a plain integer (no thousands separator); otherwise falls
// back to the locale-aware number format.
export function formatYear(value) {
  return typeof value === "number" && isFinite(value) && value >= 0 && value <= 9999 && value % 1 === 0
    ? `${value}`
    : Number.isNaN(value)
    ? "NaN"
    : formatNumber()(value);
}

// Returns true if all finite values in the given domain are integers in
// [1000, 3000], indicating they might represent years.
export function isYearDomain(domain) {
  let one = false;
  for (const d of domain) {
    if (d == null) continue;
    if (typeof d !== "number") return false;
    if (!isFinite(d)) continue;
    if (d < 1000 || d > 3000 || d % 1 !== 0) return false;
    one = true;
  }
  return one;
}
