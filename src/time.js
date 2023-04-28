import {utcSecond, utcMinute, utcHour, unixDay, utcWeek, utcMonth, utcYear} from "d3";
import {utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSunday} from "d3";
import {timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear} from "d3";
import {timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeSunday} from "d3";

const timeIntervals = new Map([
  ["second", timeSecond],
  ["minute", timeMinute],
  ["hour", timeHour],
  ["day", timeDay], // TODO local time equivalent of unixDay?
  ["week", timeWeek],
  ["month", timeMonth],
  ["year", timeYear],
  ["monday", timeMonday],
  ["tuesday", timeTuesday],
  ["wednesday", timeWednesday],
  ["thursday", timeThursday],
  ["friday", timeFriday],
  ["saturday", timeSaturday],
  ["sunday", timeSunday]
]);

const utcIntervals = new Map([
  ["second", utcSecond],
  ["minute", utcMinute],
  ["hour", utcHour],
  ["day", unixDay],
  ["week", utcWeek],
  ["month", utcMonth],
  ["year", utcYear],
  ["monday", utcMonday],
  ["tuesday", utcTuesday],
  ["wednesday", utcWednesday],
  ["thursday", utcThursday],
  ["friday", utcFriday],
  ["saturday", utcSaturday],
  ["sunday", utcSunday]
]);

function parseInterval(input, intervals) {
  let name = `${input}`.toLowerCase();
  switch (name) {
    case "quarter":
      return intervals.get("month").every(3);
    case "half":
      return intervals.get("month").every(6);
  }
  let interval, period;
  if (/s$/.test(name)) name = name.slice(0, -1);
  const match = /^(?:(\d+)\s+)/.exec(name);
  if (match) {
    name = name.slice(match[0].length);
    period = +match[1];
  }
  interval = intervals.get(name);
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
