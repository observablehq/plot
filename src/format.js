import {format as isoFormat} from "isoformat";
import {memoize1} from "./memoize.js";

const numberFormat = memoize1(locale => new Intl.NumberFormat(locale));
const monthFormat = memoize1((locale, month) => new Intl.DateTimeFormat(locale, {timeZone: "UTC", month}));
const weekdayFormat = memoize1((locale, weekday) => new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday}));

export function formatNumber(locale = "en-US") {
  const format = numberFormat(locale);
  return i => i != null && !isNaN(i) ? format.format(i) : undefined;
}

export function formatMonth(locale = "en-US", month = "short") {
  const format = monthFormat(locale, month);
  return i => i != null && !isNaN(i = new Date(Date.UTC(2000, +i))) ? format.format(i) : undefined;
}

export function formatWeekday(locale = "en-US", weekday = "short") {
  const format = weekdayFormat(locale, weekday);
  return i => i != null && !isNaN(i = new Date(Date.UTC(2001, 0, +i))) ? format.format(i) : undefined;
}

export function formatIsoDate(date) {
  return isoFormat(date, "Invalid Date");
}
