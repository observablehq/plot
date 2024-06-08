import type {LiteralTimeInterval, NiceIntervalImplementation} from "./interval.js";

/** Given a string *period*, returns a corresponding local time nice interval. */
export function timeInterval(period: LiteralTimeInterval): NiceIntervalImplementation<Date>;

/** Given a string *period*, returns a corresponding UTC nice interval. */
export function utcInterval(period: LiteralTimeInterval): NiceIntervalImplementation<Date>;
