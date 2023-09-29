import assert from "assert";
import * as d3 from "d3";
import {maybeTimeInterval, maybeUtcInterval} from "../../src/time.js";

it("maybeTimeInterval('period') returns the expected time interval", () => {
  assert.strictEqual(maybeTimeInterval("second"), d3.timeSecond);
  assert.strictEqual(maybeTimeInterval("minute"), d3.timeMinute);
  assert.strictEqual(maybeTimeInterval("hour"), d3.timeHour);
  assert.strictEqual(maybeTimeInterval("day"), d3.timeDay);
  assert.strictEqual(maybeTimeInterval("week"), d3.timeWeek);
  assert.strictEqual(maybeTimeInterval("month"), d3.timeMonth);
  assert.strictEqual(maybeTimeInterval("year"), d3.timeYear);
  assert.strictEqual(maybeTimeInterval("monday"), d3.timeMonday);
  assert.strictEqual(maybeTimeInterval("tuesday"), d3.timeTuesday);
  assert.strictEqual(maybeTimeInterval("wednesday"), d3.timeWednesday);
  assert.strictEqual(maybeTimeInterval("thursday"), d3.timeThursday);
  assert.strictEqual(maybeTimeInterval("friday"), d3.timeFriday);
  assert.strictEqual(maybeTimeInterval("saturday"), d3.timeSaturday);
  assert.strictEqual(maybeTimeInterval("sunday"), d3.timeSunday);
});

it("maybeTimeInterval('periods') returns the expected time interval", () => {
  assert.strictEqual(maybeTimeInterval("seconds"), d3.timeSecond);
  assert.strictEqual(maybeTimeInterval("minutes"), d3.timeMinute);
  assert.strictEqual(maybeTimeInterval("hours"), d3.timeHour);
  assert.strictEqual(maybeTimeInterval("days"), d3.timeDay);
  assert.strictEqual(maybeTimeInterval("weeks"), d3.timeWeek);
  assert.strictEqual(maybeTimeInterval("months"), d3.timeMonth);
  assert.strictEqual(maybeTimeInterval("years"), d3.timeYear);
  assert.strictEqual(maybeTimeInterval("mondays"), d3.timeMonday);
  assert.strictEqual(maybeTimeInterval("tuesdays"), d3.timeTuesday);
  assert.strictEqual(maybeTimeInterval("wednesdays"), d3.timeWednesday);
  assert.strictEqual(maybeTimeInterval("thursdays"), d3.timeThursday);
  assert.strictEqual(maybeTimeInterval("fridays"), d3.timeFriday);
  assert.strictEqual(maybeTimeInterval("saturdays"), d3.timeSaturday);
  assert.strictEqual(maybeTimeInterval("sundays"), d3.timeSunday);
});

it("maybeTimeInterval('1 periods) returns the expected time interval", () => {
  assert.strictEqual(maybeTimeInterval("1 second"), d3.timeSecond);
  assert.strictEqual(maybeTimeInterval("1 minute"), d3.timeMinute);
  assert.strictEqual(maybeTimeInterval("1 hour"), d3.timeHour);
  assert.strictEqual(maybeTimeInterval("1 day"), d3.timeDay);
  assert.strictEqual(maybeTimeInterval("1 week"), d3.timeWeek);
  assert.strictEqual(maybeTimeInterval("1 month"), d3.timeMonth);
  assert.strictEqual(maybeTimeInterval("1 year"), d3.timeYear);
  assert.strictEqual(maybeTimeInterval("1 monday"), d3.timeMonday);
  assert.strictEqual(maybeTimeInterval("1 tuesday"), d3.timeTuesday);
  assert.strictEqual(maybeTimeInterval("1 wednesday"), d3.timeWednesday);
  assert.strictEqual(maybeTimeInterval("1 thursday"), d3.timeThursday);
  assert.strictEqual(maybeTimeInterval("1 friday"), d3.timeFriday);
  assert.strictEqual(maybeTimeInterval("1 saturday"), d3.timeSaturday);
  assert.strictEqual(maybeTimeInterval("1 sunday"), d3.timeSunday);
});

it("maybeTimeInterval('1 periods') returns the expected time interval", () => {
  assert.strictEqual(maybeTimeInterval("1 seconds"), d3.timeSecond);
  assert.strictEqual(maybeTimeInterval("1 minutes"), d3.timeMinute);
  assert.strictEqual(maybeTimeInterval("1 hours"), d3.timeHour);
  assert.strictEqual(maybeTimeInterval("1 days"), d3.timeDay);
  assert.strictEqual(maybeTimeInterval("1 weeks"), d3.timeWeek);
  assert.strictEqual(maybeTimeInterval("1 months"), d3.timeMonth);
  assert.strictEqual(maybeTimeInterval("1 years"), d3.timeYear);
  assert.strictEqual(maybeTimeInterval("1 mondays"), d3.timeMonday);
  assert.strictEqual(maybeTimeInterval("1 tuesdays"), d3.timeTuesday);
  assert.strictEqual(maybeTimeInterval("1 wednesdays"), d3.timeWednesday);
  assert.strictEqual(maybeTimeInterval("1 thursdays"), d3.timeThursday);
  assert.strictEqual(maybeTimeInterval("1 fridays"), d3.timeFriday);
  assert.strictEqual(maybeTimeInterval("1 saturdays"), d3.timeSaturday);
  assert.strictEqual(maybeTimeInterval("1 sundays"), d3.timeSunday);
});

it("maybeTimeInterval('n seconds') returns the expected time interval", () => {
  const start = new Date("2012-01-01T12:01:02");
  const end = new Date("2012-01-01T12:14:08");
  assert.deepStrictEqual(maybeTimeInterval("5 seconds").range(start, end), d3.timeSecond.every(5).range(start, end));
  assert.deepStrictEqual(maybeTimeInterval("15 seconds").range(start, end), d3.timeSecond.every(15).range(start, end));
  assert.deepStrictEqual(maybeTimeInterval("45 seconds").range(start, end), d3.timeSecond.every(45).range(start, end));
});

it("maybeUtcInterval('period') returns the expected UTC interval", () => {
  assert.strictEqual(maybeUtcInterval("second"), d3.utcSecond);
  assert.strictEqual(maybeUtcInterval("minute"), d3.utcMinute);
  assert.strictEqual(maybeUtcInterval("hour"), d3.utcHour);
  assert.strictEqual(maybeUtcInterval("day"), d3.unixDay);
  assert.strictEqual(maybeUtcInterval("week"), d3.utcWeek);
  assert.strictEqual(maybeUtcInterval("month"), d3.utcMonth);
  assert.strictEqual(maybeUtcInterval("year"), d3.utcYear);
  assert.strictEqual(maybeUtcInterval("monday"), d3.utcMonday);
  assert.strictEqual(maybeUtcInterval("tuesday"), d3.utcTuesday);
  assert.strictEqual(maybeUtcInterval("wednesday"), d3.utcWednesday);
  assert.strictEqual(maybeUtcInterval("thursday"), d3.utcThursday);
  assert.strictEqual(maybeUtcInterval("friday"), d3.utcFriday);
  assert.strictEqual(maybeUtcInterval("saturday"), d3.utcSaturday);
  assert.strictEqual(maybeUtcInterval("sunday"), d3.utcSunday);
});

it("maybeUtcInterval('periods') returns the expected UTC interval", () => {
  assert.strictEqual(maybeUtcInterval("seconds"), d3.utcSecond);
  assert.strictEqual(maybeUtcInterval("minutes"), d3.utcMinute);
  assert.strictEqual(maybeUtcInterval("hours"), d3.utcHour);
  assert.strictEqual(maybeUtcInterval("days"), d3.unixDay);
  assert.strictEqual(maybeUtcInterval("weeks"), d3.utcWeek);
  assert.strictEqual(maybeUtcInterval("months"), d3.utcMonth);
  assert.strictEqual(maybeUtcInterval("years"), d3.utcYear);
  assert.strictEqual(maybeUtcInterval("mondays"), d3.utcMonday);
  assert.strictEqual(maybeUtcInterval("tuesdays"), d3.utcTuesday);
  assert.strictEqual(maybeUtcInterval("wednesdays"), d3.utcWednesday);
  assert.strictEqual(maybeUtcInterval("thursdays"), d3.utcThursday);
  assert.strictEqual(maybeUtcInterval("fridays"), d3.utcFriday);
  assert.strictEqual(maybeUtcInterval("saturdays"), d3.utcSaturday);
  assert.strictEqual(maybeUtcInterval("sundays"), d3.utcSunday);
});

it("maybeUtcInterval('1 periods) returns the expected UTC interval", () => {
  assert.strictEqual(maybeUtcInterval("1 second"), d3.utcSecond);
  assert.strictEqual(maybeUtcInterval("1 minute"), d3.utcMinute);
  assert.strictEqual(maybeUtcInterval("1 hour"), d3.utcHour);
  assert.strictEqual(maybeUtcInterval("1 day"), d3.unixDay);
  assert.strictEqual(maybeUtcInterval("1 week"), d3.utcWeek);
  assert.strictEqual(maybeUtcInterval("1 month"), d3.utcMonth);
  assert.strictEqual(maybeUtcInterval("1 year"), d3.utcYear);
  assert.strictEqual(maybeUtcInterval("1 monday"), d3.utcMonday);
  assert.strictEqual(maybeUtcInterval("1 tuesday"), d3.utcTuesday);
  assert.strictEqual(maybeUtcInterval("1 wednesday"), d3.utcWednesday);
  assert.strictEqual(maybeUtcInterval("1 thursday"), d3.utcThursday);
  assert.strictEqual(maybeUtcInterval("1 friday"), d3.utcFriday);
  assert.strictEqual(maybeUtcInterval("1 saturday"), d3.utcSaturday);
  assert.strictEqual(maybeUtcInterval("1 sunday"), d3.utcSunday);
});

it("maybeUtcInterval('1 periods') returns the expected UTC interval", () => {
  assert.strictEqual(maybeUtcInterval("1 seconds"), d3.utcSecond);
  assert.strictEqual(maybeUtcInterval("1 minutes"), d3.utcMinute);
  assert.strictEqual(maybeUtcInterval("1 hours"), d3.utcHour);
  assert.strictEqual(maybeUtcInterval("1 days"), d3.unixDay);
  assert.strictEqual(maybeUtcInterval("1 weeks"), d3.utcWeek);
  assert.strictEqual(maybeUtcInterval("1 months"), d3.utcMonth);
  assert.strictEqual(maybeUtcInterval("1 years"), d3.utcYear);
  assert.strictEqual(maybeUtcInterval("1 mondays"), d3.utcMonday);
  assert.strictEqual(maybeUtcInterval("1 tuesdays"), d3.utcTuesday);
  assert.strictEqual(maybeUtcInterval("1 wednesdays"), d3.utcWednesday);
  assert.strictEqual(maybeUtcInterval("1 thursdays"), d3.utcThursday);
  assert.strictEqual(maybeUtcInterval("1 fridays"), d3.utcFriday);
  assert.strictEqual(maybeUtcInterval("1 saturdays"), d3.utcSaturday);
  assert.strictEqual(maybeUtcInterval("1 sundays"), d3.utcSunday);
});

it("maybeUtcInterval('n seconds') returns the expected UTC interval", () => {
  const start = new Date("2012-01-01T12:01:02");
  const end = new Date("2012-01-01T12:14:08");
  assert.deepStrictEqual(maybeUtcInterval("5 seconds").range(start, end), d3.utcSecond.every(5).range(start, end));
  assert.deepStrictEqual(maybeUtcInterval("15 seconds").range(start, end), d3.utcSecond.every(15).range(start, end));
  assert.deepStrictEqual(maybeUtcInterval("45 seconds").range(start, end), d3.utcSecond.every(45).range(start, end));
});
