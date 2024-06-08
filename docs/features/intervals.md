<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

</script>

# Intervals <VersionBadge pr="2075" />

These helper functions are provided for convenience as a **tick** option for [scales](./scales.md), as the **thresholds** option for a [bin transform](../transforms/bin.md), or other use. See also [d3-time](https://d3js.org/d3-time).

## numberInterval(*period*) {#numberInterval}

```js
Plot.numberInterval(2)
```

Given a number *period*, returns a corresponding range interval implementation. The returned interval implements the *interval*.range, *interval*.floor, and *interval*.offset methods.

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
