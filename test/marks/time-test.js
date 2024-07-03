import assert from "assert";
import * as d3 from "d3";
import {timeInterval, utcInterval} from "../../src/time.js";

it("timeInterval('period') returns the expected time interval", () => {
  assert.strictEqual(timeInterval("second"), d3.timeSecond);
  assert.strictEqual(timeInterval("minute"), d3.timeMinute);
  assert.strictEqual(timeInterval("hour"), d3.timeHour);
  assert.strictEqual(timeInterval("day"), d3.timeDay);
  assert.strictEqual(timeInterval("week"), d3.timeWeek);
  assert.strictEqual(timeInterval("month"), d3.timeMonth);
  assert.strictEqual(timeInterval("year"), d3.timeYear);
  assert.strictEqual(timeInterval("monday"), d3.timeMonday);
  assert.strictEqual(timeInterval("tuesday"), d3.timeTuesday);
  assert.strictEqual(timeInterval("wednesday"), d3.timeWednesday);
  assert.strictEqual(timeInterval("thursday"), d3.timeThursday);
  assert.strictEqual(timeInterval("friday"), d3.timeFriday);
  assert.strictEqual(timeInterval("saturday"), d3.timeSaturday);
  assert.strictEqual(timeInterval("sunday"), d3.timeSunday);
});

it("timeInterval('periods') returns the expected time interval", () => {
  assert.strictEqual(timeInterval("seconds"), d3.timeSecond);
  assert.strictEqual(timeInterval("minutes"), d3.timeMinute);
  assert.strictEqual(timeInterval("hours"), d3.timeHour);
  assert.strictEqual(timeInterval("days"), d3.timeDay);
  assert.strictEqual(timeInterval("weeks"), d3.timeWeek);
  assert.strictEqual(timeInterval("months"), d3.timeMonth);
  assert.strictEqual(timeInterval("years"), d3.timeYear);
  assert.strictEqual(timeInterval("mondays"), d3.timeMonday);
  assert.strictEqual(timeInterval("tuesdays"), d3.timeTuesday);
  assert.strictEqual(timeInterval("wednesdays"), d3.timeWednesday);
  assert.strictEqual(timeInterval("thursdays"), d3.timeThursday);
  assert.strictEqual(timeInterval("fridays"), d3.timeFriday);
  assert.strictEqual(timeInterval("saturdays"), d3.timeSaturday);
  assert.strictEqual(timeInterval("sundays"), d3.timeSunday);
});

it("timeInterval('1 periods) returns the expected time interval", () => {
  assert.strictEqual(timeInterval("1 second"), d3.timeSecond);
  assert.strictEqual(timeInterval("1 minute"), d3.timeMinute);
  assert.strictEqual(timeInterval("1 hour"), d3.timeHour);
  assert.strictEqual(timeInterval("1 day"), d3.timeDay);
  assert.strictEqual(timeInterval("1 week"), d3.timeWeek);
  assert.strictEqual(timeInterval("1 month"), d3.timeMonth);
  assert.strictEqual(timeInterval("1 year"), d3.timeYear);
  assert.strictEqual(timeInterval("1 monday"), d3.timeMonday);
  assert.strictEqual(timeInterval("1 tuesday"), d3.timeTuesday);
  assert.strictEqual(timeInterval("1 wednesday"), d3.timeWednesday);
  assert.strictEqual(timeInterval("1 thursday"), d3.timeThursday);
  assert.strictEqual(timeInterval("1 friday"), d3.timeFriday);
  assert.strictEqual(timeInterval("1 saturday"), d3.timeSaturday);
  assert.strictEqual(timeInterval("1 sunday"), d3.timeSunday);
});

it("timeInterval('1 periods') returns the expected time interval", () => {
  assert.strictEqual(timeInterval("1 seconds"), d3.timeSecond);
  assert.strictEqual(timeInterval("1 minutes"), d3.timeMinute);
  assert.strictEqual(timeInterval("1 hours"), d3.timeHour);
  assert.strictEqual(timeInterval("1 days"), d3.timeDay);
  assert.strictEqual(timeInterval("1 weeks"), d3.timeWeek);
  assert.strictEqual(timeInterval("1 months"), d3.timeMonth);
  assert.strictEqual(timeInterval("1 years"), d3.timeYear);
  assert.strictEqual(timeInterval("1 mondays"), d3.timeMonday);
  assert.strictEqual(timeInterval("1 tuesdays"), d3.timeTuesday);
  assert.strictEqual(timeInterval("1 wednesdays"), d3.timeWednesday);
  assert.strictEqual(timeInterval("1 thursdays"), d3.timeThursday);
  assert.strictEqual(timeInterval("1 fridays"), d3.timeFriday);
  assert.strictEqual(timeInterval("1 saturdays"), d3.timeSaturday);
  assert.strictEqual(timeInterval("1 sundays"), d3.timeSunday);
});

it("timeInterval('n seconds') returns the expected time interval", () => {
  const start = new Date("2012-01-01T12:01:02");
  const end = new Date("2012-01-01T12:14:08");
  assert.deepStrictEqual(timeInterval("5 seconds").range(start, end), d3.timeSecond.every(5).range(start, end));
  assert.deepStrictEqual(timeInterval("15 seconds").range(start, end), d3.timeSecond.every(15).range(start, end));
  assert.deepStrictEqual(timeInterval("45 seconds").range(start, end), d3.timeSecond.every(45).range(start, end));
});

it("utcInterval('period') returns the expected UTC interval", () => {
  assert.strictEqual(utcInterval("second"), d3.utcSecond);
  assert.strictEqual(utcInterval("minute"), d3.utcMinute);
  assert.strictEqual(utcInterval("hour"), d3.utcHour);
  assert.strictEqual(utcInterval("day"), d3.unixDay);
  assert.strictEqual(utcInterval("week"), d3.utcWeek);
  assert.strictEqual(utcInterval("month"), d3.utcMonth);
  assert.strictEqual(utcInterval("year"), d3.utcYear);
  assert.strictEqual(utcInterval("monday"), d3.utcMonday);
  assert.strictEqual(utcInterval("tuesday"), d3.utcTuesday);
  assert.strictEqual(utcInterval("wednesday"), d3.utcWednesday);
  assert.strictEqual(utcInterval("thursday"), d3.utcThursday);
  assert.strictEqual(utcInterval("friday"), d3.utcFriday);
  assert.strictEqual(utcInterval("saturday"), d3.utcSaturday);
  assert.strictEqual(utcInterval("sunday"), d3.utcSunday);
});

it("utcInterval('periods') returns the expected UTC interval", () => {
  assert.strictEqual(utcInterval("seconds"), d3.utcSecond);
  assert.strictEqual(utcInterval("minutes"), d3.utcMinute);
  assert.strictEqual(utcInterval("hours"), d3.utcHour);
  assert.strictEqual(utcInterval("days"), d3.unixDay);
  assert.strictEqual(utcInterval("weeks"), d3.utcWeek);
  assert.strictEqual(utcInterval("months"), d3.utcMonth);
  assert.strictEqual(utcInterval("years"), d3.utcYear);
  assert.strictEqual(utcInterval("mondays"), d3.utcMonday);
  assert.strictEqual(utcInterval("tuesdays"), d3.utcTuesday);
  assert.strictEqual(utcInterval("wednesdays"), d3.utcWednesday);
  assert.strictEqual(utcInterval("thursdays"), d3.utcThursday);
  assert.strictEqual(utcInterval("fridays"), d3.utcFriday);
  assert.strictEqual(utcInterval("saturdays"), d3.utcSaturday);
  assert.strictEqual(utcInterval("sundays"), d3.utcSunday);
});

it("utcInterval('1 periods) returns the expected UTC interval", () => {
  assert.strictEqual(utcInterval("1 second"), d3.utcSecond);
  assert.strictEqual(utcInterval("1 minute"), d3.utcMinute);
  assert.strictEqual(utcInterval("1 hour"), d3.utcHour);
  assert.strictEqual(utcInterval("1 day"), d3.unixDay);
  assert.strictEqual(utcInterval("1 week"), d3.utcWeek);
  assert.strictEqual(utcInterval("1 month"), d3.utcMonth);
  assert.strictEqual(utcInterval("1 year"), d3.utcYear);
  assert.strictEqual(utcInterval("1 monday"), d3.utcMonday);
  assert.strictEqual(utcInterval("1 tuesday"), d3.utcTuesday);
  assert.strictEqual(utcInterval("1 wednesday"), d3.utcWednesday);
  assert.strictEqual(utcInterval("1 thursday"), d3.utcThursday);
  assert.strictEqual(utcInterval("1 friday"), d3.utcFriday);
  assert.strictEqual(utcInterval("1 saturday"), d3.utcSaturday);
  assert.strictEqual(utcInterval("1 sunday"), d3.utcSunday);
});

it("utcInterval('1 periods') returns the expected UTC interval", () => {
  assert.strictEqual(utcInterval("1 seconds"), d3.utcSecond);
  assert.strictEqual(utcInterval("1 minutes"), d3.utcMinute);
  assert.strictEqual(utcInterval("1 hours"), d3.utcHour);
  assert.strictEqual(utcInterval("1 days"), d3.unixDay);
  assert.strictEqual(utcInterval("1 weeks"), d3.utcWeek);
  assert.strictEqual(utcInterval("1 months"), d3.utcMonth);
  assert.strictEqual(utcInterval("1 years"), d3.utcYear);
  assert.strictEqual(utcInterval("1 mondays"), d3.utcMonday);
  assert.strictEqual(utcInterval("1 tuesdays"), d3.utcTuesday);
  assert.strictEqual(utcInterval("1 wednesdays"), d3.utcWednesday);
  assert.strictEqual(utcInterval("1 thursdays"), d3.utcThursday);
  assert.strictEqual(utcInterval("1 fridays"), d3.utcFriday);
  assert.strictEqual(utcInterval("1 saturdays"), d3.utcSaturday);
  assert.strictEqual(utcInterval("1 sundays"), d3.utcSunday);
});

it("utcInterval('n seconds') returns the expected UTC interval", () => {
  const start = new Date("2012-01-01T12:01:02");
  const end = new Date("2012-01-01T12:14:08");
  assert.deepStrictEqual(utcInterval("5 seconds").range(start, end), d3.utcSecond.every(5).range(start, end));
  assert.deepStrictEqual(utcInterval("15 seconds").range(start, end), d3.utcSecond.every(15).range(start, end));
  assert.deepStrictEqual(utcInterval("45 seconds").range(start, end), d3.utcSecond.every(45).range(start, end));
});
