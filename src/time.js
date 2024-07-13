import {bisector, max, pairs, timeFormat, utcFormat} from "d3";
import {utcSecond, utcMinute, utcHour, unixDay, utcWeek, utcMonth, utcYear} from "d3";
import {utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSunday} from "d3";
import {timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear} from "d3";
import {timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeSunday} from "d3";
import {orderof} from "./order.js";

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

// See https://github.com/d3/d3-time/blob/9e8dc940f38f78d7588aad68a54a25b1f0c2d97b/src/ticks.js#L14-L33
const tickIntervals = [
  ["millisecond", 1],
  ["2 milliseconds", 2],
  ["5 milliseconds", 5],
  ["10 milliseconds", 10],
  ["20 milliseconds", 20],
  ["50 milliseconds", 50],
  ["100 milliseconds", 100],
  ["200 milliseconds", 200],
  ["500 milliseconds", 500],
  ["second", durationSecond],
  ["5 seconds", 5 * durationSecond],
  ["15 seconds", 15 * durationSecond],
  ["30 seconds", 30 * durationSecond],
  ["minute", durationMinute],
  ["5 minutes", 5 * durationMinute],
  ["15 minutes", 15 * durationMinute],
  ["30 minutes", 30 * durationMinute],
  ["hour", durationHour],
  ["3 hours", 3 * durationHour],
  ["6 hours", 6 * durationHour],
  ["12 hours", 12 * durationHour],
  ["day", durationDay],
  ["2 days", 2 * durationDay],
  ["week", durationWeek],
  ["2 weeks", 2 * durationWeek], // https://github.com/d3/d3-time/issues/46
  ["month", durationMonth],
  ["3 months", 3 * durationMonth],
  ["6 months", 6 * durationMonth], // https://github.com/d3/d3-time/issues/46
  ["year", durationYear],
  ["2 years", 2 * durationYear],
  ["5 years", 5 * durationYear],
  ["10 years", 10 * durationYear],
  ["20 years", 20 * durationYear],
  ["50 years", 50 * durationYear],
  ["100 years", 100 * durationYear] // TODO generalize to longer time scales
];

const durations = new Map([
  ["second", durationSecond],
  ["minute", durationMinute],
  ["hour", durationHour],
  ["day", durationDay],
  ["monday", durationWeek],
  ["tuesday", durationWeek],
  ["wednesday", durationWeek],
  ["thursday", durationWeek],
  ["friday", durationWeek],
  ["saturday", durationWeek],
  ["sunday", durationWeek],
  ["week", durationWeek],
  ["month", durationMonth],
  ["year", durationYear]
]);

const timeIntervals = new Map([
  ["second", timeSecond],
  ["minute", timeMinute],
  ["hour", timeHour],
  ["day", timeDay], // https://github.com/d3/d3-time/issues/62
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

// These hidden fields describe standard intervals so that we can, for example,
// generalize a scale’s time interval to a larger ticks time interval to reduce
// the number of displayed ticks. TODO We could instead allow the interval
// implementation to expose a “generalize” method that returns a larger, aligned
// interval; that would allow us to move this logic to D3, and allow
// generalization even when a custom interval is provided.
export const intervalDuration = Symbol("intervalDuration");
export const intervalType = Symbol("intervalType");

// We greedily mutate D3’s standard intervals on load so that the hidden fields
// are available even if specified as e.g. d3.utcMonth instead of "month".
for (const [name, interval] of timeIntervals) {
  interval[intervalDuration] = durations.get(name);
  interval[intervalType] = "time";
}
for (const [name, interval] of utcIntervals) {
  interval[intervalDuration] = durations.get(name);
  interval[intervalType] = "utc";
}

const utcFormatIntervals = [
  ["year", utcYear, "utc"],
  ["month", utcMonth, "utc"],
  ["day", unixDay, "utc", 6 * durationMonth],
  ["hour", utcHour, "utc", 3 * durationDay],
  ["minute", utcMinute, "utc", 6 * durationHour],
  ["second", utcSecond, "utc", 30 * durationMinute]
];

const timeFormatIntervals = [
  ["year", timeYear, "time"],
  ["month", timeMonth, "time"],
  ["day", timeDay, "time", 6 * durationMonth],
  ["hour", timeHour, "time", 3 * durationDay],
  ["minute", timeMinute, "time", 6 * durationHour],
  ["second", timeSecond, "time", 30 * durationMinute]
];

// An interleaved array of UTC and local time intervals, in descending order
// from largest to smallest, used to determine the most specific standard time
// format for a given array of dates. This is a subset of the tick intervals
// listed above; we only need the breakpoints where the format changes.
const formatIntervals = [
  utcFormatIntervals[0],
  timeFormatIntervals[0],
  utcFormatIntervals[1],
  timeFormatIntervals[1],
  utcFormatIntervals[2],
  timeFormatIntervals[2],
  // Below day, local time typically has an hourly offset from UTC and hence the
  // two are aligned and indistinguishable; therefore, we only consider UTC, and
  // we don’t consider these if the domain only has a single value.
  ...utcFormatIntervals.slice(3)
];

export function parseTimeInterval(input) {
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
  let interval = utcIntervals.get(name);
  if (!interval) throw new Error(`unknown interval: ${input}`);
  if (period > 1 && !interval.every) throw new Error(`non-periodic interval: ${name}`);
  return [name, period];
}

export function timeInterval(input) {
  return asInterval(parseTimeInterval(input), "time");
}

export function utcInterval(input) {
  return asInterval(parseTimeInterval(input), "utc");
}

function asInterval([name, period], type) {
  let interval = (type === "time" ? timeIntervals : utcIntervals).get(name);
  if (period > 1) {
    interval = interval.every(period);
    interval[intervalDuration] = durations.get(name) * period;
    interval[intervalType] = type;
  }
  return interval;
}

// If the given interval is a standard time interval, we may be able to promote
// it a larger aligned time interval, rather than showing every nth tick.
export function generalizeTimeInterval(interval, n) {
  if (!(n > 1)) return; // no need to generalize
  const duration = interval[intervalDuration];
  if (!tickIntervals.some(([, d]) => d === duration)) return; // nonstandard or unknown interval
  if (duration % durationDay === 0 && durationDay < duration && duration < durationMonth) return; // not generalizable
  const [i] = tickIntervals[bisector(([, step]) => Math.log(step)).center(tickIntervals, Math.log(duration * n))];
  return (interval[intervalType] === "time" ? timeInterval : utcInterval)(i);
}

function formatTimeInterval(name, type, anchor) {
  const format = type === "time" ? timeFormat : utcFormat;
  // For tips and legends, use a format that doesn’t require context.
  if (anchor == null) {
    return format(
      name === "year"
        ? "%Y"
        : name === "month"
        ? "%Y-%m"
        : name === "day"
        ? "%Y-%m-%d"
        : name === "hour" || name === "minute"
        ? "%Y-%m-%dT%H:%M"
        : name === "second"
        ? "%Y-%m-%dT%H:%M:%S"
        : "%Y-%m-%dT%H:%M:%S.%L"
    );
  }
  // Otherwise, assume that this is for axis ticks.
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

function getFormatIntervals(type) {
  return type === "time" ? timeFormatIntervals : type === "utc" ? utcFormatIntervals : formatIntervals;
}

// Given an array of dates, returns the largest compatible standard time
// interval. If no standard interval is compatible (other than milliseconds,
// which is universally compatible), returns undefined.
export function inferTimeFormat(type, dates, anchor) {
  const step = max(pairs(dates, (a, b) => Math.abs(b - a))); // maybe undefined!
  if (step < 1000) return formatTimeInterval("millisecond", "utc", anchor);
  for (const [name, interval, intervalType, maxStep] of getFormatIntervals(type)) {
    if (step > maxStep) break; // e.g., 52 weeks
    if (name === "hour" && !step) break; // e.g., domain with a single date
    if (dates.every((d) => interval.floor(d) >= d)) return formatTimeInterval(name, intervalType, anchor);
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
