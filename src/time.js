import {utcSecond, utcMinute, utcHour, utcDay, utcWeek, utcMonth, utcYear} from "d3";
import {utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSunday} from "d3";
import {timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear} from "d3";
import {timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeSunday} from "d3";

const timeIntervals = new Map([
  ["second", timeSecond],
  ["minute", timeMinute],
  ["hour", timeHour],
  ["day", timeDay],
  ["week", timeWeek],
  ["month", timeMonth],
  ["quarter", timeMonth.every(3)],
  ["half", timeMonth.every(6)],
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
  ["day", utcDay],
  ["week", utcWeek],
  ["month", utcMonth],
  ["quarter", utcMonth.every(3)],
  ["half", utcMonth.every(6)],
  ["year", utcYear],
  ["monday", utcMonday],
  ["tuesday", utcTuesday],
  ["wednesday", utcWednesday],
  ["thursday", utcThursday],
  ["friday", utcFriday],
  ["saturday", utcSaturday],
  ["sunday", utcSunday]
]);

export function maybeTimeInterval(interval) {
  const i = timeIntervals.get(`${interval}`.toLowerCase());
  if (!i) throw new Error(`unknown interval: ${interval}`);
  return i;
}

export function maybeUtcInterval(interval) {
  const i = utcIntervals.get(`${interval}`.toLowerCase());
  if (!i) throw new Error(`unknown interval: ${interval}`);
  return i;
}
