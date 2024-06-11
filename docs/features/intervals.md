<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

</script>

# Intervals <VersionBadge pr="2075" />

Plot provides several built-in interval implementations for use with the **tick** option for [scales](./scales.md), as the **thresholds** option for a [bin transform](../transforms/bin.md), or other use. See also [d3-time](https://d3js.org/d3-time). You can also implement custom intervals.

At a minimum, intervals implement *interval*.**floor** and *interval*.**offset**. Range intervals additionally implement *interval*.**range**, and nice intervals additionally implement *interval*.**ceil**. These latter implementations are required in some contexts; see Plot’s TypeScript definitions for details.

The *interval*.**floor** method takes a *value* and returns the corresponding value representing the greatest interval boundary less than or equal to the specified *value*. For example, for the “day” time interval, it returns the preceding midnight:

```js
Plot.utcInterval("day").floor(new Date("2013-04-12T12:34:56Z")) // 2013-04-12
```

The *interval*.**offset** method takes a *value* and returns the corresponding value equal to *value* plus *step* intervals. If *step* is not specified it defaults to 1. If *step* is negative, then the returned value will be less than the specified *value*. For example:

```js
Plot.utcInterval("day").offset(new Date("2013-04-12T12:34:56Z"), 1) // 2013-04-13T12:34:56Z
Plot.utcInterval("day").offset(new Date("2013-04-12T12:34:56Z"), -2) // 2013-03-22T12:34:56Z
```

The *interval*.**range** method returns an array of values representing every interval boundary greater than or equal to *start* (inclusive) and less than *stop* (exclusive). The first value in the returned array is the least boundary greater than or equal to *start*; subsequent values are offset by intervals and floored.

```js
Plot.utcInterval("week").range(new Date("2013-04-12T12:34:56Z"), new Date("2013-05-12T12:34:56Z")) // [2013-04-14, 2013-04-21, 2013-04-28, 2013-05-05, 2013-05-12]
```

The *interval*.**ceil** method returns the value representing the least interval boundary value greater than or equal to the specified *value*. For example, for the “day” time interval, it returns the preceding midnight:

```js
Plot.utcInterval("day").ceil(new Date("2013-04-12T12:34:56Z")) // 2013-04-13
```

## numberInterval(*period*) {#numberInterval}

```js
Plot.numberInterval(2)
```

Given a number *period*, returns a corresponding range interval implementation. If *period* is a negative number, the resulting interval uses 1 / -*period*; this allows more precise results when *period* is a negative integer. The returned interval implements the *interval*.range, *interval*.floor, and *interval*.offset methods.

## timeInterval(*period*) {#timeInterval}

```js
Plot.timeInterval("2 days")
```

Given a string *period* describing a local time interval, returns a corresponding nice interval implementation. The period can be *second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*, *saturday*, or *sunday*, or a skip interval consisting of a number followed by the interval name (possibly pluralized), such as *3 months* or *10 years*. The returned interval implements the *interval*.range, *interval*.floor, *interval*.ceil, and *interval*.offset methods.

## utcInterval(*period*) {#utcInterval}

```js
Plot.utcInterval("2 days")
```

Given a string *period* describing a UTC time interval, returns a corresponding nice interval implementation. The period can be *second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*, *saturday*, or *sunday*, or a skip interval consisting of a number followed by the interval name (possibly pluralized), such as *3 months* or *10 years*. The returned interval implements the *interval*.range, *interval*.floor, *interval*.ceil, and *interval*.offset methods.
