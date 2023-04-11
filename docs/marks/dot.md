# Dot

The **dot** mark represents data as circles, typically positioned in *x* and *y* quantitative dimensions, as in a scatterplot. For example, the scatterplot below shows the roughly-inverse relationship in a dataset of cars between power (in horsepower) in *y*↑ and fuel efficiency (in miles per gallon) in *x*→.

```js
Plot.plot({
  grid: true,
  marks: [
    Plot.dot(cars, {x: "economy (mpg)", y: "power (hp)"})
  ]
})
```

Using a functional definition of *x*, we can instead plot the roughly-linear relationship when fuel efficiency is represented as gallons per 100 miles (similar to the liters per 100 km metric used in countries that have adopted the metric system). Note that this data set contains nulls; these are converted to NaN to prevent coercion to zero.

```js
Plot.plot({
  grid: true,
  inset: 10,
  x: {
    label: "Fuel consumption (gallons per 100 miles) →"
  },
  y: {
    label: "↑ Horsepower"
  },
  marks: [
    Plot.dot(cars, {
      x: d => 100 / (d["economy (mpg)"] ?? NaN),
      y: "power (hp)"
    })
  ]
})
```

Dots support *stroke* and *fill* channels in addition to position along *x* and *y*. Below, color is used as a redundant encoding with *y*-position to emphasize the rising trend in average global surface temperatures. A diverging color scale assigns values below the mean blue and above the mean red. Plot can optionally generate the associated legend.

```js
Plot.plot({
  y: {
    grid: true,
    tickFormat: "+f",
    label: "↑ Surface temperature anomaly (°F)"
  },
  color: {
    type: "diverging",
    scheme: "BuRd",
    legend: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
  ]
})
```

Dots also support an *r* channel allowing the size of dots to represent data. Below, each dot represents a trading day; the *x*-position represents the day’s change, while the *y*-position and area (*r*) represent the day’s trading volume. As you might expect, days with higher volatility have higher trading volume.

```js
Plot.plot({
  grid: true,
  x: {
    label: "Daily change (%) →",
    tickFormat: "+f",
    transform: d => d * 100
  },
  y: {
    label: "↑ Daily trading volume",
    type: "log",
    tickFormat: "~s"
  },
  marks: [
    Plot.ruleX([0]),
    Plot.dot(aapl, {x: d => (d.Close - d.Open) / d.Open, y: "Volume", r: "Volume"})
  ]
})
```

With the [*bin* transform](../transforms/bin.md), sized dots can also be used as an alternative to a [rect-based](./rect.md) heatmap to show a two-dimensional distribution.

```js
Plot.plot({
  height: 640,
  grid: true,
  x: {
    label: "Carats →"
  },
  y: {
    label: "↑ Price ($)"
  },
  r: {
    range: [0, 20]
  },
  marks: [
    Plot.dot(diamonds, Plot.bin({r: "count"}, {x: "carat", y: "price", thresholds: 100}))
  ]
})
```

While dots are typically positioned in two dimensions (*x* and *y*), one-dimensional dots (only *x* or only *y*) are also supported. Below, dot area is used to represent the frequency of letters in the English language as a compact alternative to a bar chart.

```js
Plot.plot({
  marks: [
    Plot.dot(alphabet, {x: "letter", r: "frequency", fill: "currentColor"})
  ]
})
```

Dots can also be used to mark observations in low-density data, so it’s easy to distinguish what was observed from what is interpolated. For example, the connected scatterplot below plots how the relationship between annual per capita driving and the price of gasoline has changed over time. (This recreates Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009.)

```js
Plot.plot({
  grid: true,
  x: {
    label: "Miles driven (per capita per year) →"
  },
  y: {
    label: "↑ Price of gas (average per gallon, adjusted)"
  },
  marks: [
    Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom"}),
    Plot.dot(driving, {x: "miles", y: "gas", fill: "currentColor"}),
    Plot.text(driving, {filter: d => d.year % 5 === 0, x: "miles", y: "gas", text: "year", dy: -8})
  ]
})
```

Dots, together with [rules](./rule.md), can be used as a stylistic alternative to [bars](./bar.md) to produce a “lollipop” chart. Sadly these lollipops cannot actually be eaten.

```js
Plot.plot({
  x: {
    label: null,
    tickSize: 0
  },
  y: {
    label: "↑ Frequency (%)",
    transform: d => d * 100
  },
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX(alphabet, {x: "letter", y: "frequency", fill: "black"}),
    Plot.dot(alphabet, {x: "letter", y: "frequency", fill: "black", r: 4})
  ]
})
```

Sometimes, a scatterplot may have an ordinal dimension on either *x* and *y*, as in the plot below comparing the demographics of states: color represents age group, and *x* represents the proportion of the state’s population in that age group. A *reduce* transform is used to pull out the minimum and maximum values for each state such that a rule can span the extent for better Gestalt grouping.

```js
stateage = {
  const data = await FileAttachment("us-population-state-age.csv").csv({typed: true});
  const ages = data.columns.slice(1); // convert wide data to tidy data
  return Object.assign(ages.flatMap(age => data.map(d => ({state: d.name, age, population: d[age]}))), {ages});
}
```

```js
{
  const xy = Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state"});
  return Plot.plot({
    height: 660,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: d => d * 100
    },
    y: {
      axis: null
    },
    color: {
      scheme: "spectral",
      domain: stateage.ages, // in order
      legend: true
    },
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(stateage, Plot.groupY({x1: "min", x2: "max"}, xy)),
      Plot.dot(stateage, {...xy, fill: "age", title: "age"}),
      Plot.text(stateage, Plot.selectMinX({...xy, textAnchor: "end", dx: -6, text: "state"}))
    ]
  });
}
```

As another example of a scatterplot with an ordinal dimension, we can plot age groups along the *x*-axis and connect states with lines. This emphasizes the overall age distribution of the United States, while giving a hint to variation across states.

```js
{
  const xy = Plot.normalizeY({basis: "sum", z: "state", x: "age", y: "population"});
  return Plot.plot({
    grid: true,
    x: {
      domain: stateage.ages, // in order
      label: "Age range (years) →",
      labelAnchor: "right"
    },
    y: {
      label: "↑ Percent of population (%)",
      transform: d => d * 100
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(stateage, {...xy, strokeWidth: 1, stroke: "#ccc"}),
      Plot.dot(stateage, xy)
    ]
  });
}
```

Another visualization technique supported by the dot mark is the [quantile-quantile (QQ) plot](https://observablehq.com/d/6bb4330bca6eba2b); this is used to compare univariate two distributions.
