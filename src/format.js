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
