# Window

Plot.**windowY** and Plot.**windowX** are specialized [map transforms](https://observablehq.com/@observablehq/plot-map?collection=@observablehq/plot), which take a series of numeric values as input and average them (or, more generically, reduce them) over a sliding window:

<!-- viewof k = Inputs.range([1, 20], { value: 7, step: 1, label: "k" }) -->

<!-- viewof anchor = Inputs.select(["start", "middle", "end"], {label: "anchor", value: "middle"}) -->

<!-- viewof strict = Inputs.toggle({label: "strict", value: false}) -->

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Daily temperature range (°F)"
  },
  marks: [
    Plot.areaY(temp, {
      x: "date",
      y1: "low",
      y2: "high",
      curve: "step",
      fill: "#ccc"
    }),
    Plot.line(
      temp,
      Plot.windowY({
        k,
        anchor,
        strict
      }, {
        x: "date",
        y: "low",
        curve: "step",
        stroke: "blue"
      })
    ),
    Plot.line(
      temp,
      Plot.windowY({
        k,
        anchor,
        strict
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
        temp,
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

```js
{
  const reduce = "mode";
  const median = d3.median(temp, (d) => d.middle);
  return Plot.plot({
    caption: `Reducer: ${reduce}`,
    marks: [
      Plot.tickX(
        temp,
        Plot.windowY({
          anchor,
          reduce,
          k,
          x: "date",
          y: (d) => Math.sign(d.middle - median)
        })
      )
    ],
    height: 100,
    y: { domain: [-1, 1], tickFormat: (d) => (d < 0 ? "lower" : "higher") }
  });
}
```

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

  const median = d3.median(temp, (d) => d.middle);

  return Plot.plot({
    caption: `Custom map`,
    marks: [
      Plot.tickX(
        temp,
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
      temp,
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
    domain: d3.extent(temp, (d) => d.middle)
  },
  marks: [
    Plot.lineY(
      temp,
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
      temp,
      Plot.windowY({
        k: days,
        reduce: bollinger(K),
        x: "date",
        y: "middle",
        curve: "basis",
        stroke: "#ccc"
      })
    ),
    Plot.dot(temp, {
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
    domain: d3.extent(temp, (d) => d.middle)
  },
  marks: [
    Plot.areaY(
      temp,
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
    Plot.dot(temp, {
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
      domain: d3.extent(temp, (d) => d.middle)
    },
    color: {
      domain: [false],
      range: ["orange"]
    },
    marks: [
      Plot.areaY(
        temp,
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
        temp,
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
      Plot.line(temp, {
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
  const tempWithGaps = temp.slice(0, 100)
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
