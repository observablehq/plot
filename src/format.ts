/* eslint-disable @typescript-eslint/no-explicit-any */
import {format as isoFormat} from "isoformat";
import {string} from "./options.js";
import {memoize1} from "./memoize.js";

const numberFormat = memoize1<Intl.NumberFormat>(
  (locale: string | string[] | undefined) => new Intl.NumberFormat(locale)
);
const monthFormat = memoize1<Intl.DateTimeFormat>(
  (locale: string | string[] | undefined, month: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined) =>
    new Intl.DateTimeFormat(locale, {timeZone: "UTC", month})
);
const weekdayFormat = memoize1<Intl.DateTimeFormat>(
  (locale: string | string[] | undefined, weekday: "long" | "short" | "narrow" | undefined) =>
    new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday})
);

export function formatNumber(locale = "en-US"): (value: any) => string | undefined {
  const format = numberFormat(locale);
  return (i: any) => (i != null && !isNaN(i) ? format.format(i) : undefined);
}

export function formatMonth(
  locale = "en-US",
  month: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined = "short"
) {
  const format = monthFormat(locale, month);
  return (i: Date | number | null | undefined) =>
    i != null && !isNaN((i = +new Date(Date.UTC(2000, +i)))) ? format.format(i) : undefined;
}

export function formatWeekday(locale = "en-US", weekday: "long" | "short" | "narrow" | undefined = "short") {
  const format = weekdayFormat(locale, weekday);
  return (i: Date | number | null | undefined) =>
    i != null && !isNaN((i = +new Date(Date.UTC(2001, 0, +i)))) ? format.format(i) : undefined;
}

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
