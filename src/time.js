import {bisector, extent, median, pairs, tickStep, timeFormat, utcFormat, zip} from "d3";
import {utcSecond, utcMinute, utcHour, unixDay, utcWeek, utcMonth, utcYear} from "d3";
import {utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSunday} from "d3";
import {timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear} from "d3";
import {timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeSunday} from "d3";
import {formatDefault} from "./format.js";
import {orderof} from "./options.js";

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const durationMin = Math.exp((Math.log(500) + Math.log(durationSecond)) / 2);
const durationMax = Math.exp((Math.log(6 * durationMonth) + Math.log(durationYear)) / 2);

// [format, interval, step]; year and millisecond are handled dynamically
// See https://github.com/d3/d3-time/blob/9e8dc940f38f78d7588aad68a54a25b1f0c2d97b/src/ticks.js#L14-L33
const formats = [
  ["second", "1 second", durationSecond],
  ["second", "30 seconds", 30 * durationSecond],
  ["minute", "1 minute", durationMinute],
  ["minute", "30 minutes", 30 * durationMinute],
  ["hour", "1 hour", durationHour],
  ["hour", "12 hours", 12 * durationHour],
  ["day", "1 day", durationDay],
  ["day", "2 days", 2 * durationDay],
  ["day", "1 week", durationWeek],
  ["day", "2 weeks", 2 * durationWeek],
  ["month", "1 month", durationMonth],
  ["month", "3 months", 3 * durationMonth],
  ["month", "6 months", 6 * durationMonth] // https://github.com/d3/d3-time/issues/46
];

// Note: this must be in order from smallest to largest!
const timeIntervals = new Map([
  ["second", timeSecond],
  ["minute", timeMinute],
  ["hour", timeHour],
  ["day", timeDay], // TODO local time equivalent of unixDay?
  ["monday", timeMonday],
  ["tuesday", timeTuesday],
  ["wednesday", timeWednesday],
  ["thursday", timeThursday],
  ["friday", timeFriday],
  ["saturday", timeSaturday],
  ["sunday", timeSunday],
  ["week", timeWeek],
  ["month", timeMonth],
  ["year", timeYear]
]);

// Note: this must be in order from smallest to largest!
const utcIntervals = new Map([
  ["second", utcSecond],
  ["minute", utcMinute],
  ["hour", utcHour],
  ["day", unixDay],
  ["monday", utcMonday],
  ["tuesday", utcTuesday],
  ["wednesday", utcWednesday],
  ["thursday", utcThursday],
  ["friday", utcFriday],
  ["saturday", utcSaturday],
  ["sunday", utcSunday],
  ["week", utcWeek],
  ["month", utcMonth],
  ["year", utcYear]
]);

// An interleaved array of UTC and local time intervals in order from largest to
// smallest; used by inferTimeInterval below, which is used to determine the
// most specific standard time interval for a given array of dates. Note that
// this does not consider skip intervals such as 2 days, 3 weeks, or 6 months.
const descendingIntervals = zip(
  Array.from(utcIntervals, ([name, interval]) => [name, interval, "utc"]),
  Array.from(timeIntervals, ([name, interval]) => [name, interval, "time"])
)
  .flat(1)
  .reverse();

function parseInterval(input, intervals) {
  let name = `${input}`.toLowerCase();
  if (name.endsWith("s")) name = name.slice(0, -1); // drop plural
  let period = 1;
  const match = /^(?:(\d+)\s+)/.exec(name);
  if (match) {
    name = name.slice(match[0].length);
    period = +match[1];
  }
  switch (name) {
    case "quarter":
      name = "month";
      period *= 3;
      break;
    case "half":
      name = "month";
      period *= 6;
      break;
  }
  let interval = intervals.get(name);
  if (!interval) throw new Error(`unknown interval: ${input}`);
  if (!(period > 1)) return interval;
  if (!interval.every) throw new Error(`non-periodic interval: ${name}`);
  return interval.every(period);
}

export function maybeTimeInterval(interval) {
  return parseInterval(interval, timeIntervals);
}

export function maybeUtcInterval(interval) {
  return parseInterval(interval, utcIntervals);
}

export function isUtcYear(i) {
  if (!i) return false;
  const date = i.floor(new Date(Date.UTC(2000, 11, 31)));
  return utcYear(date) >= date; // coercing equality
}

export function isTimeYear(i) {
  if (!i) return false;
  const date = i.floor(new Date(2000, 11, 31));
  return timeYear(date) >= date; // coercing equality
}

// Compute the median difference between adjacent ticks, ignoring repeated
// ticks; this implies an effective time interval, assuming that ticks are
// regularly spaced; choose the largest format less than this interval so that
// the ticks show the field that is changing. If the ticks are not available,
// fallback to an approximation based on the desired number of ticks.
export function formatTimeTicks(scale, data, ticks, anchor) {
  let step = median(pairs(data, (a, b) => Math.abs(b - a) || NaN));
  if (!(step > 0)) {
    const [start, stop] = extent(scale.domain());
    const count = typeof ticks === "number" ? ticks : 10;
    step = Math.abs(stop - start) / count;
  }
  return formatTimeInterval(inferTimeFormat(step)[0], scale.type, anchor);
}

function formatTimeInterval(interval, type, anchor) {
  const format = type === "time" ? timeFormat : utcFormat;
  const template = getTimeTemplate(anchor);
  switch (interval) {
    case "millisecond":
      return formatConditional(format(".%L"), format(":%M:%S"), template);
    case "second":
      return formatConditional(format(":%S"), format("%-I:%M"), template);
    case "minute":
      return formatConditional(format("%-I:%M"), format("%p"), template);
    case "hour":
      return formatConditional(format("%-I %p"), format("%b %-d"), template);
    case "day":
      return formatConditional(format("%-d"), format("%b"), template);
    case "month":
      return formatConditional(format("%b"), format("%Y"), template);
    case "year":
      return format("%Y");
  }
  throw new Error("unable to format time ticks");
}

function getTimeTemplate(anchor) {
  return anchor === "left" || anchor === "right"
    ? (f1, f2) => `\n${f1}\n${f2}` // extra newline to keep f1 centered
    : anchor === "top"
    ? (f1, f2) => `${f2}\n${f1}`
    : (f1, f2) => `${f1}\n${f2}`;
}

// Use the median step s to determine the standard time interval i that is
// closest to the median step s times n (per 1). For example, if the scale’s
// interval is day and n = 20, then i = month; if the scale’s interval is day
// and n = 7, then i = week.
export function inferTimeFormat(s) {
  if (s < durationMin) return (s = tickStep(0, s, 1)), ["millisecond", `${s} milliseconds`, s];
  if (s > durationMax) return (s = tickStep(0, s / durationYear, 1)), ["year", `${s} years`, s * durationYear];
  return formats[bisector(([, , step]) => Math.log(step)).center(formats, Math.log(s))];
}

// Given an array of dates, returns the largest compatible standard time
// interval. If no standard interval is compatible (other than milliseconds,
// which is universally compatible), returns undefined.
export function inferTimeFormat2(dates, anchor) {
  for (const [name, interval, type] of descendingIntervals) {
    if (dates.every((d) => interval.floor(d) >= d)) {
      return formatTimeInterval(name, type, anchor);
    }
  }
  return formatDefault;
}

// TODO This assumes that the format is called sequentially, but if we filter
// the format by wrapping it then it does not behave as desired. We probably
// want to make the format stateful, or we need to pass in a skip value here…
function formatConditional(format1, format2, template) {
  // TODO n is messy, don’t do this
  return (x, i, X, n = 1) => {
    const f1 = format1(x, i); // always shown
    const f2 = format2(x, i); // only shown if different
    const j = i - orderof(X) * n; // detect reversed domains
    return i !== j && X[j] !== undefined && f2 === format2(X[j], j) ? f1 : template(f1, f2);
  };
}
