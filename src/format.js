export function formatMonth(locale, month = "short") {
  const format = {timeZone: "UTC", month};
  return i => {
    if (i != null && !isNaN(i = new Date(Date.UTC(2000, +i)))) {
      return i.toLocaleString(locale, format);
    }
  };
}

export function formatWeekday(locale, weekday = "short") {
  const format = {timeZone: "UTC", weekday};
  return i => {
    if (i != null && !isNaN(i = new Date(Date.UTC(2001, 0, +i)))) {
      return i.toLocaleString(locale, format);
    }
  };
}
