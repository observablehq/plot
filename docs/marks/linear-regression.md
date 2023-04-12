# Linear regression mark

Regression methods show trends by creating a mathematical model of how an observation (called the _dependent variable_, typically **y**) depends on a given input (called the _independent variable_, typically **x**). A linear model posits that _y_ is determined by an underlying affine function ${tex`y = a + b x`}, where _a_ is a constant (intercept of the line on the _y_-axis when _x_ = 0) and _b_ is the slope.

```js
Plot.plot({
  marks: [
    Plot.dot(cars, {x: "weight (lb)", y: "power (hp)", strokeOpacity: 0.5, r: 2}),
    Plot.linearRegressionY(cars, {x: "weight (lb)", y: "power (hp)", stroke: "steelblue", ci: 0.95})
  ]
})
```

Given a set of values {*x*, *y*}, the linear regression method returns the most likely parameters _a_ and _b_ for the model, as well as a confidence band showing the range where these parameters lie with a certain probability, called **ci** (for confidence interval), which defaults to 0.95.

```js
Plot.plot({
  marks: [
    Plot.dot(cars, {x: "weight (lb)", y: "power (hp)", strokeOpacity: 0.5, r: 2}),
    Plot.dot(cars.slice(0, m), {x: "weight (lb)", y: "power (hp)", fill: "steelblue", r: 2}),
    Plot.linearRegressionY(cars.slice(0, m), {x: "weight (lb)", y: "power (hp)", stroke: "steelblue"})
  ]
})
```

Use the slider below to build a linear from a subset of the data; as you can see, the model gives a line as soon as two points are available, and gets more refined and stable as the size of the subset increases. When operating on a subset of the data (the “training dataset”, in machine learning parlance), it is usually better to have a wider domain of *x* values, maybe by shuffling the data.

<!-- viewof m = Inputs.range([0, cars.length], {step: 1, label: "Number of points"}) -->

```js
Plot.plot({
  marks: [
    Plot.dot(cars, {x: "weight (lb)", y: "power (hp)", strokeOpacity: 0.5, r: 2}),
    Plot.dot(carsByWeight.slice(0, m), {x: "weight (lb)", y: "power (hp)", fill: "steelblue", r: 2}),
    Plot.dot(carsByWeight.slice(m), {x: "weight (lb)", y: "power (hp)", fill: "orange", r: 2}),
    Plot.linearRegressionY(carsByWeight.slice(0, m), {x: "weight (lb)", y: "power (hp)", stroke: "steelblue", ci: 0.95}),
    Plot.linearRegressionY(carsByWeight.slice(m), {x: "weight (lb)", y: "power (hp)", stroke: "orange", ci: 0.95})
  ]
})
```

<!-- carsByWeight = d3.sort(cars, d => d["weight (lb)"]) -->

This type of model is regularly criticized for pushing people to the wrong conclusions about their data when the actual underlying structure or process is nonlinear. For example, if you measure the relationship between culmen depth and length in a mixed population of penguins, it is positively correlated in each of the three species (bigger penguins with the longer culmens also tend to have the deeper ones); however, the Gentoo population has a smaller aspect ratio of depth against length, and the overall correlation across the three species is negative. This is called [Simpson’s paradox](https://en.wikipedia.org/wiki/Simpson%27s_paradox), and it applies to any data that contains underlying populations with different properties or outcomes.

```js
Plot.plot({
  grid: true,
  color: {legend: true},
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species"}),
    Plot.linearRegressionY(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"}),
    Plot.linearRegressionY(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

Finally, note that regression is not a symmetric method: the model computed to express _y_ as a function of _x_ (linearRegressionY) doesn’t give the same result as the regression of _x_ as a function of _y_ (linearRegressionX) unless the points are all perfectly aligned. In the worst case, where the two variables are statistically independent, the linear regression of _y_ against _x_ is an horizontal line, whereas the linear regression of _x_ against _y_ is a vertical line.

```js
Plot.plot({
  marks: [
    Plot.dot(cars, {x: "weight (lb)", y: "power (hp)", strokeOpacity: 0.5, r: 2}),
    Plot.linearRegressionY(cars, {x: "weight (lb)", y: "power (hp)", stroke: "steelblue"}),
    Plot.linearRegressionX(cars, {x: "weight (lb)", y: "power (hp)", stroke: "orange"})
  ]
})
```

### Linear regression options

Draws [linear regression](https://en.wikipedia.org/wiki/Linear_regression) lines with confidence bands, representing the estimated relation of a dependent variable (typically *y*) on an independent variable (typically *x*). The linear regression line is fit using the [least squares](https://en.wikipedia.org/wiki/Least_squares) approach. See Torben Jansen’s [“Linear regression with confidence bands”](https://observablehq.com/@toja/linear-regression-with-confidence-bands) and [this StatExchange question](https://stats.stackexchange.com/questions/101318/understanding-shape-and-calculation-of-confidence-bands-in-linear-regression) for details on the confidence interval calculation.

The given *options* are passed through to these underlying marks, with the exception of the following options:

* **stroke** - the stroke color of the regression line; defaults to *currentColor*
* **fill** - the fill color of the confidence band; defaults to the line’s *stroke*
* **fillOpacity** - the fill opacity of the confidence band; defaults to 0.1
* **ci** - the confidence interval in [0, 1), or 0 to hide bands; defaults to 0.95
* **precision** - the distance (in pixels) between samples of the confidence band; defaults to 4

Multiple regressions can be defined by specifying the *z*, *fill*, or *stroke* channel.

## linearRegressionX(*data*, *options*)

```js
Plot.linearRegressionX(mtcars, {y: "wt", x: "hp"})
```

Returns a linear regression mark where *x* is the dependent variable and *y* is the independent variable.

## linearRegressionY(*data*, *options*)

```js
Plot.linearRegressionY(mtcars, {x: "wt", y: "hp"})
```

Returns a linear regression mark where *y* is the dependent variable and *x* is the independent variable.
