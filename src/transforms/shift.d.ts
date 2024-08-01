import type {Interval} from "../interval.js";
import type {Transformed} from "./basic.js";

/**
 * Groups data into series using the first channel of *z*, *fill*, or *stroke*
 * (if any), then derives *x1* and *x2* output channels by shifting the input
 * *x* channel according to the specified *interval*.
 */
export function shiftX<T>(interval: Interval, options?: T): Transformed<T>;

/**
 * Groups data into series using the first channel of *z*, *fill*, or *stroke*
 * (if any), then derives *y1* and *y2* output channels by shifting the input
 * *y* channel according to the specified *interval*.
 */
export function shiftY<T>(interval: Interval, options?: T): Transformed<T>;
