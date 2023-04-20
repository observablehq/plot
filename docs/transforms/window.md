<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import sftemp from "../data/sf-temperatures.ts";

</script>

# Window transform

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

The Plot.windowX and Plot.windowY transforms compute a moving window around each data point and then derive a summary statistic from values in the current window, say to compute rolling averages, rolling minimums, or rolling maximums.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Daily temperature range (°F)"
  },
  marks: [
    Plot.areaY(temp, {x: "date", y1: "low", y2: "high", curve: "step", fill: "#ccc"}),
    Plot.line(temp, Plot.windowY({x: "date", y: "low", k: 7, curve: "step", stroke: "blue"})),
    Plot.line(temp, Plot.windowY({x: "date", y: "high", k: 7, curve: "step", stroke: "red"}))
  ]
})
```

Plot.**windowY** and Plot.**windowX** are specialized [map transforms](https://observablehq.com/@observablehq/plot-map), which take a series of numeric values as input and average them (or, more generically, reduce them) over a sliding window:

<!-- viewof k = Inputs.range([1, 20], { value: 7, step: 1, label: "k" }) -->

<!-- viewof anchor = Inputs.select(["start", "middle", "end"], {label: "anchor", value: "middle"}) -->

<!-- viewof strict = Inputs.toggle({label: "strict", value: false}) -->

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Daily temperature range (°F)"
  },
  marks: [
    Plot.areaY(sftemp, {
      x: "date",
      y1: "low",
      y2: "high",
      curve: "step",
      fill: "#ccc"
    }),
    Plot.line(
      sftemp,
      Plot.windowY({
        k: 7, // TODO k
        anchor: "middle", // TODO anchor
        strict: false // TODO strict
      }, {
        x: "date",
        y: "low",
        curve: "step",
        stroke: "blue"
      })
    ),
    Plot.line(
      sftemp,
      Plot.windowY({
        k: 7, // TODO k
        anchor: "middle", // TODO anchor
        strict: false // TODO strict
      }, {
        x: "date",
        y: "high",
        curve: "step",
        stroke: "red"
      })
    )
  ]
})
```
:::

TK another example

The band above is spikey; we can smooth it by applying a 14-day moving average to **y1** and **y2**, and do the same for a midline. We can also add a [rule](../marks/rule.md) to indicate the freezing point, 32°F.

:::plot
```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    grid: true
  },
  marks: [
    Plot.ruleY([32]),
    Plot.areaY(sftemp, Plot.windowY(14, {x: "date", y1: "low", y2: "high", fillOpacity: 0.3})),
    Plot.line(sftemp, Plot.windowY(14, {x: "date", y: (d) => (d.low + d.high) / 2}))
  ]
})
```
:::

In each data series (possibly grouped by *z* and by facet), a moving window of *k* values advances and each subset is reduced to a single value. The values are taken in input order—compose with Plot.sort if necessary (see [below](#sort)).

The window transforms have four options:

- **k**, the _width_ of the window, is the (integer) number of consecutive
  elements that will be considered for each position. _k_ must be specified and
  greater than 1, otherwise the transform will throw an error.
- **anchor**, defaults to _middle_. Other options are _start_ and _end_. The
  computations are the same, but the anchor changes the point where the moving
  value will be imputed. For _start_, the computed value will be imputed to the
  first point of the window; for _end_, to the last one; the "middle" anchor
  will be in the center of the window, for example in position 3 if _k_ = 7, and
  2 for _k_ = 6. (If _k_ is even, the position is taken as
  ${tex`\left \lfloor \frac{k - 1}{2} \right \rfloor `}).
- **reduce**, the reducer. Defaults to _mean_. Describes how the _k_ numeric values in the window are
  reduced to one value.
- **strict**, whether to return NaN when a value is missing in the window. When set to true, any window that is incomplete returns NaN.

The impact of **k**, **anchor**, and **strict** can be visualized in the interactive chart above.

### Reducers

Built-in options are numerous:

  - *min* - the minimum
  - *max* - the maximum
  - *mean* - the mean (average)
  - *median* - the median
  - *mode* - the mode (most common occurrence)
  - *sum* - the sum of values
  - *deviation* - the standard deviation
  - *variance* - the variance per Welford’s algorithm
  - *difference* - the difference between the last and first window value
  - *ratio* - the ratio of the last and first window value

Here are a few examples of these reducers, applied to the same data:

```js
htl.html`${["min", "median", "max", "difference"].map((reduce) =>
  Plot.plot({
    caption: `Reducer: ${reduce}`,
    y: { grid: true },
    marks: [
      Plot.line(
        sftemp,
        Plot.windowY({
          anchor,
          reduce,
          k,
          x: "date",
          y: "middle"
        })
      )
    ],
    height: 250
  })
)}`
```

The *mode* reducer returns the most-seen *number* in the window, and can be used to gauge if the majority of temperatures in the current window have been greater than the median temperature.

:::plot
```js
Plot.plot({
  caption: `Reducer: ${"mean"}`, // TODO reduce
  marks: [
    Plot.tickX(
      sftemp,
      Plot.windowY({
        reduce: "mean", // TODO reduce
        k: 7, // TODO k
        x: "date",
        y: (d) => Math.sign(d.middle - median)
      })
    )
  ],
  height: 100,
  y: { domain: [-1, 1], tickFormat: (d) => (d < 0 ? "lower" : "higher") }
})
```
:::

---
**Side note.** It would be tempting to use the *mode* reducer (or the custom function reducer) for categorical data, beyond numbers; however, the Plot.window transforms are optimized for numbers and coerce all values to a typed array of floats, precluding their use with other data types. But an equivalent Plot.map transform is possible:

```js
{
  const categoricalWindowY = ({ anchor, k, reduce = d3.mean, ...options }) =>
    Plot.map(
      {
        y: (v) => {
          const R = Array.from(v, () => null);
          const a =
            anchor === "start" ? 0 : anchor === "end" ? k - 1 : (k - 1) >> 1;
          for (let i = 0; i + k < v.length; i++) {
            R[a + i] = reduce(v.slice(i, i + k + 1));
          }
          return R;
        }
      },
      options
    );

  const median = d3.median(sftemp, (d) => d.middle);

  return Plot.plot({
    caption: `Custom map`,
    marks: [
      Plot.tickX(
        sftemp,
        categoricalWindowY({
          anchor: "start",
          reduce: d3.mode,
          k,
          x: "date",
          y: (d) => (d.middle < median ? "lower" : "higher")
        })
      )
    ],
    // Here I purposefully didn't remove NaN from the y domain, a situation which happens
    // at the beginning and end of the x domain; uncomment the following line to see the difference
    // y: { domain: ["lower", "higher"] },
    height: 100
  });
}
```

---
### Vertical transform (windowX)

Plot.**windowX** is symmetrical to Plot.**windowY**; we’ll use it here to illustrate the *deviation* reducer:

```js
Plot.plot({
  caption: `Reducer: deviation`,
  marks: [
    Plot.areaX(
      sftemp,
      Plot.windowX({
        anchor,
        reduce: "deviation",
        k: 20,
        y: "date",
        x: "middle",
        offset: "center",
        fill: "brown"
      })
    )
  ],
  marginLeft: 150,
  height: 250,
  x: { axis: null },
  y: { ticks: 12, tickFormat: d => Plot.formatMonth()(d.getMonth()) }
})
```

### Custom reducers

When the built-in reducers are not enough, we can use our own function. In the following example, we’ll introduce a function that takes a windowed sample array of ${days} values, and returns the mean plus the standard deviation of the sample, times an arbitrary multiplier *K*—not to be confused with the window width *k*. If *K* is positive, say +2, this gives a local estimate of the 95%-percentile of the distribution; conversely, if *K* is negative (-2), this estimates the 5%-percentile.

```js
bollinger = (K) => (values) => d3.mean(values) + K * d3.deviation(values)
```

```js
Plot.plot({
  y: {
    nice: true,
    grid: true,
    domain: d3.extent(sftemp, (d) => d.middle)
  },
  marks: [
    Plot.lineY(
      sftemp,
      Plot.windowY({
        k: days,
        reduce: bollinger(-K),
        x: "date",
        y: "middle",
        curve: "basis",
        stroke: "#ccc"
      })
    ),
    Plot.lineY(
      sftemp,
      Plot.windowY({
        k: days,
        reduce: bollinger(K),
        x: "date",
        y: "middle",
        curve: "basis",
        stroke: "#ccc"
      })
    ),
    Plot.dot(sftemp, {
      x: "date",
      y: "middle",
      fill: "black",
      r: 1.5
    })
  ]
})
```

### Multiple reducers

The area between these two lines is called the [Bollinger band](https://en.wikipedia.org/wiki/Bollinger_Bands). If we want to plot it as an area, instead of two separate lines, we’ll need to compute the two reductions in the same mark. This is possible thanks to a combination of Plot.**map** and Plot.**window**:

<!-- viewof K = Inputs.range([0.5, 4], {
  value: 2,
  label: "Bollinger multiplier",
  step: 0.1
}) -->

<!-- viewof days = Inputs.range([2, 20], {
  value: 7,
  step: 1,
  label: html`days (<em>k</em>)`
}) -->

```js
Plot.plot({
  y: {
    nice: true,
    grid: true,
    domain: d3.extent(sftemp, (d) => d.middle)
  },
  marks: [
    Plot.areaY(
      sftemp,
      Plot.map(
        {
          y1: Plot.window({ k: days, reduce: bollinger(-K) }),
          y2: Plot.window({ k: days, reduce: bollinger(K) })
        },
        {
          x: "date",
          y: "middle",
          curve: "basis",
          fill: "#ccc"
        }
      )
    ),
    Plot.dot(sftemp, {
      x: "date",
      y: "middle",
      fill: "black",
      r: 1.5
    })
  ]
})
```

And, to go a step further, we might want to display the Bollinger band as well as any outlier data points that are outside that band. This time, it’s the *fill* property of the dots that we want to be the target of the window transform, and this can be achieved, again, by using Plot.**map** in combination with Plot.**window**:

```js
{
  // the reference point inside a window depends on the anchor
  const ref =
    anchor === "start" ? 0 : anchor === "end" ? days - 1 : (days - 1) >> 1;

  return Plot.plot({
    y: {
      nice: true,
      grid: true,
      domain: d3.extent(sftemp, (d) => d.middle)
    },
    color: {
      domain: [false],
      range: ["orange"]
    },
    marks: [
      Plot.areaY(
        sftemp,
        Plot.map(
          {
            y1: Plot.window({
              k: days,
              anchor,
              reduce: bollinger(-K)
            }),
            y2: Plot.window({
              anchor,
              k: days,
              reduce: bollinger(K)
            })
          },
          {
            x: "date",
            y: "middle",
            fill: "#eef9ff",
            curve: "basis"
          }
        )
      ),

      Plot.dot(
        sftemp,
        // color dots according to their being an outlier of the bollinger band
        Plot.map(
          {
            fill: Plot.window({
              anchor,
              k: days,
              reduce: (V) =>
                Math.abs(V[ref] - d3.mean(V)) <= K * d3.deviation(V)
            })
          },
          {
            x: "date",
            y: "middle",
            z: null, // avoids grouping on fill
            fill: "middle"
          }
        )
      ),
      Plot.line(sftemp, {
        x: "date",
        y: "middle",
        strokeWidth: 0.5
      })
    ],
    width
  });
}
```

### Missing values and the _strict_ option

The value computed for a window is imputed to the start, middle or end index of the window—and this, by construction, leaves a gap on either or both ends of the data series. Furthermore, any window which contains a NaN automatically creates a gap of length *k*. These gaps are ignored, unless the *strict* option is set to true. In the example below, the orange line is a moving average of valid values, contrasting with the brown line which is broken each time an invalid value (a brown dot) appears:

```js
{
  // add fake data gaps for demo purposes
  const tempWithGaps = sftemp.slice(0, 100)
    .map((d, i) => ({
      ...d,
      valueOrGap: [22, 53, 60, 87].includes(i) ? NaN : d.middle
    }));

  return Plot.plot({
    caption: `Use the strict: true option to create a gap when a window is incomplete`,
    marks: [
      Plot.dot(tempWithGaps, {
        x: "date",
        y: (d) => d.valueOrGap || 43.5,
        fill: (d) => !!d.valueOrGap,
        r: 2.5
      }),

      Plot.line(
        tempWithGaps,
        Plot.windowY({
          k: 5,
          x: "date",
          y: "valueOrGap",
          stroke: "orange",
          strokeWidth: 4
        })
      ),
      Plot.line(
        tempWithGaps,
        Plot.windowY({
          strict: true,
          k: 5,
          x: "date",
          y: "valueOrGap",
          stroke: "brown",
          strokeWidth: 3
        })
      )
    ],
    color: { domain: [false, true], range: ["brown", "grey"] },
    height: 250
  });
}
```

**Sorting.** The values are considered in input order. If the data isn’t already sorted, consider using Plot.sort, as in the following example in which the temperatures dataset has been shuffled for the purposes of the demonstration:

<!-- viewof shuffle_sort = Inputs.toggle({label: "Apply Plot.sort"}) -->

```js
{
  let options = {x: "date", y: "middle", k: 28};
  if (shuffle_sort) options = Plot.sort("date", options);
  return Plot.lineY(shuffled, Plot.windowY(options)).plot({height: 250});
}
```

<!-- shuffled = d3.shuffle(temp.slice()) -->

<!-- temp = FileAttachment("temp.csv").csv({typed: true}) -->

## Window options

The Plot.windowX and Plot.windowY transforms compute a moving window around each data point and then derive a summary statistic from values in the current window, say to compute rolling averages, rolling minimums, or rolling maximums. These transforms also take additional options:

* **k** - the window size (the number of elements in the window)
* **anchor** - how to align the window: *start*, *middle*, or *end*
* **reduce** - the aggregation method (window reducer)
* **strict** - if true, output undefined if any window value is undefined; defaults to false

If the **strict** option is true, the output start values or end values or both (depending on the **anchor**) of each series may be undefined since there are not enough elements to create a window of size **k**; output values may also be undefined if some of the input values in the corresponding window are undefined. If the **strict** option is false (the default), the window will be automatically truncated as needed, and undefined input values are ignored. For example, if **k** is 24 and **anchor** is *middle*, then the initial 11 values have effective window sizes of 13, 14, 15, … 23, and likewise the last 12 values have effective window sizes of 23, 22, 21, … 12. Values computed with a truncated window may be noisy; if you would prefer to not show this data, set the **strict** option to true.

The following window reducers are supported:

* *min* - the minimum
* *max* - the maximum
* *mean* - the mean (average)
* *median* - the median
* *mode* - the mode (most common occurrence)
* *pXX* - the percentile value, where XX is a number in [00,99]
* *sum* - the sum of values
* *deviation* - the standard deviation
* *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
* *difference* - the difference between the last and first window value
* *ratio* - the ratio of the last and first window value
* *first* - the first value
* *last* - the last value
* a function to be passed an array of *k* values

By default, **anchor** is *middle* and **reduce** is *mean*.

## window(*k*)

```js
Plot.map({y: Plot.window(24)}, {x: "Date", y: "Close", stroke: "Symbol"})
```

Returns a window map method for the given window size *k*, suitable for use with Plot.map. For additional options to the window transform, replace the number *k* with an object with properties *k*, *anchor*, *reduce*, or *strict*.

## windowX(*k*, *options*)

```js
Plot.windowX(24, {y: "Date", x: "Anomaly"})
```

Like [Plot.mapX](#plotmapxmap-options), but applies the window map method with the given window size *k*. For additional options to the window transform, replace the number *k* with an object with properties *k*, *anchor*, or *reduce*.

## windowY(*k*, *options*)

```js
Plot.windowY(24, {x: "Date", y: "Anomaly"})
```

Like [Plot.mapY](#plotmapymap-options), but applies the window map method with the given window size *k*. For additional options to the window transform, replace the number *k* with an object with properties *k*, *anchor*, or *reduce*.
