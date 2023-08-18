import {bisector, extent, max, median, pairs, timeFormat, utcFormat} from "d3";
import {utcSecond, utcMinute, utcHour, unixDay, utcWeek, utcMonth, utcYear} from "d3";
import {utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSunday} from "d3";
import {timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear} from "d3";
import {timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeSunday} from "d3";
import {orderof} from "./options.js";

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

// See https://github.com/d3/d3-time/blob/9e8dc940f38f78d7588aad68a54a25b1f0c2d97b/src/ticks.js#L14-L33
const formats = [
  ["millisecond", 500],
  ["second", durationSecond],
  ["second", 30 * durationSecond],
  ["minute", durationMinute],
  ["minute", 30 * durationMinute],
  ["hour", durationHour],
  ["hour", 12 * durationHour],
  ["day", durationDay],
  ["day", 2 * durationWeek], // new!
  ["month", durationMonth],
  ["month", 6 * durationMonth], // new! https://github.com/d3/d3-time/issues/46
  ["year", durationYear]
];

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
// smallest, used to determine the most specific standard time format for a
// given array of dates.
const descendingIntervals = [
  ["year", utcYear, "utc"],
  ["year", timeYear, "time"],
  ["month", utcMonth, "utc"],
  ["month", timeMonth, "time"],
  ["day", unixDay, "utc", 6 * durationMonth],
  ["day", timeDay, "time", 6 * durationMonth],
  // Below day, local time typically has an hourly offset from UTC and hence the
  // two are aligned and indistinguishable; therefore, we only consider UTC.
  ["hour", utcHour, "utc", 3 * durationDay],
  ["minute", utcMinute, "utc", 6 * durationHour],
  ["second", utcSecond, "utc", 30 * durationMinute]
];

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
  const [name] = formats[bisector(([, step]) => Math.log(step)).center(formats, Math.log(step))];
  return formatTimeInterval(name, scale.type, anchor);
}

function formatTimeInterval(name, type, anchor) {
  const format = type === "time" ? timeFormat : utcFormat;
  const template = getTimeTemplate(anchor);
  switch (name) {
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

// Given an array of dates, returns the largest compatible standard time
// interval. If no standard interval is compatible (other than milliseconds,
// which is universally compatible), returns undefined.
export function inferTimeFormat(dates, anchor) {
  const step = max(pairs(dates, (a, b) => Math.abs(b - a)));
  for (const [name, interval, type, maxStep] of descendingIntervals) {
    if (dates.every((d) => interval.floor(d) >= d)) {
      if (step > maxStep) break; // e.g., 52 weeks
      return formatTimeInterval(name, type, anchor);
    }
  }
}

function formatConditional(format1, format2, template) {
  return (x, i, X) => {
    const f1 = format1(x, i); // always shown
    const f2 = format2(x, i); // only shown if different
    const j = i - orderof(X); // detect reversed domains
    return i !== j && X[j] !== undefined && f2 === format2(X[j], j) ? f1 : template(f1, f2);
  };
}
