import {memoize1} from "./memoize.js";
import {string} from "./options.js";

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
  if (!(date instanceof Date)) date = new Date(+date);
  if (isNaN(date)) return "Invalid Date";
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();
  const time = hours || minutes || seconds || milliseconds;
  return `${formatYear(date.getUTCFullYear(), 4)}${
    month || day > 1 || time
      ? `-${pad(month + 1, 2)}${
          day > 1 || time
            ? `-${pad(day, 2)}${
                time
                  ? `T${pad(hours, 2)}:${pad(minutes, 2)}${
                      seconds || milliseconds
                        ? `:${pad(seconds, 2)}${milliseconds ? `.${pad(milliseconds, 3)}` : ``}`
                        : ``
                    }Z`
                  : ``
              }`
            : ``
        }`
      : ``
  }`;
}

function formatYear(year) {
  return year < 0 ? `-${pad(-year, 6)}` : year > 9999 ? `+${pad(year, 6)}` : pad(year, 4);
}

function pad(value, width) {
  return `${value}`.padStart(width, "0");
}

export function formatAuto(locale = "en-US") {
  const number = formatNumber(locale);
  return (v) => (v instanceof Date ? formatIsoDate : typeof v === "number" ? number : string)(v);
}

// TODO When Plot supports a top-level locale option, this should be removed
// because it lacks context to know which locale to use; formatAuto should be
// used instead whenever possible.
export const formatDefault = formatAuto();

const re = /^(?:[-+]\d{2})?\d{4}(?:-\d{2}(?:-\d{2})?)?(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[-+]\d{2}:?\d{2})?)?$/;

export function parseIsoDate(string) {
  return re.test((string = String(string))) ? new Date(string) : undefined;
}
