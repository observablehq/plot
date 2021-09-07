import {format as isoFormat} from "isoformat";

export function formatMonth(locale = "en-US", month = "short") {
  const format = new Intl.DateTimeFormat(locale, {timeZone: "UTC", month});
  return i => {
    if (i != null && !isNaN(i = new Date(Date.UTC(2000, +i)))) {
      return format.format(i);
    }
  };
}

export function formatWeekday(locale = "en-US", weekday = "short") {
  const format = new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday});
  return i => {
    if (i != null && !isNaN(i = new Date(Date.UTC(2001, 0, +i)))) {
      return format.format(i);
    }
  };
}

export function formatIsoDate(date) {
  return isoFormat(date, "Invalid Date");
}
