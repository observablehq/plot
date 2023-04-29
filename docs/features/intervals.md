# Intervals

An **interval** defines how to partition a quantitative or temporal domain into discrete, contiguous intervals.

- *second*
- *minute*
- *hour*
- *day*
- *week*
- *month*
- *year*

Also, weekly intervals on different days:

- *monday*
- *tuesday*
- *wednesday*
- *thursday*
- *friday*
- *saturday*
- *sunday*

Also skip intervals, such as *15 minutes* or *10 years*. The *quarter* and *half* intervals are aliases for *3 months* and *6 months* respectively.

TODO The confusing behavior of *month* when it doesn’t align with year boundaries? Drop the field in utcMonth? Also applies to *hour* and probably others…

## Scales

The **interval** scale option.

The **nice** scale option.

## Axes

The **ticks** axis option.

The **grid** axis option.

## Marks

The **interval** mark option, bin transform:

- areaX **y**
- areaY **x**
- lineX **y**
- lineY **x**
- linearRegressionX **y**
- linearRegressionY **x**

The **interval** mark option, interval transform:

- barX **x**
- barY **y**
- rect **x** and **y**
- ruleX **y**
- ruleY **x**
- dotX **y**
- dotY **x**
- textX **y**
- textY **x**

## Transforms

The **thresholds** bin transform option.

The **interval** contour transform option.

## Custom intervals

In addition to the built-in intervals described above, you can provide a custom interval implementation by implementing the [*interval*.floor](#interval-floor-value) and [*interval*.offset](#interval-offset-value-step) methods. In some cases, you may also need to implement the [*interval*.range](#interval-range-start-stop) or [*interval*.ceil](#interval-ceil-value) methods.

### *interval*.floor(*value*)

```js
d3.utcYear.floor(new Date("2001-06-12"))
```

Returns the value representing the greatest interval boundary less than or equal to the specified *value*. For example, *day*.floor(*date*) typically returns 12:00 AM on the given date.

This method is idempotent: if the specified value is already floored to the current interval, the same value is returned. Furthermore, the returned value is the minimum expressible value of the associated interval, such that floor(floor(*value*) - *epsilon*) returns the preceding interval boundary value.

### *interval*.offset(*value*, *step*)

```js
d3.utcYear.offset(new Date("2001-06-12"), 1)
```

Returns a new value equal to *value* plus *step* intervals. If *step* is not specified it defaults to 1. If *step* is negative, then the returned value will be less than the specified *value*; if *step* is zero, then the same *value* is returned; if *step* is not an integer, it is floored.

This method does not round the specified *value* to the interval. For example, if *value* is today at 5:34 PM, then *day*.offset(*date*, 1) returns 5:34 PM tomorrow.

### *interval*.range(*start*, *stop*)

```js
d3.utcMonth.range(new Date("2001-01-01"), new Date("2002-01-01"))
```

Returns an array of values representing every interval boundary greater than or equal to *start* (inclusive) and less than *stop* (exclusive). The first value in the returned array is the least boundary greater than or equal to *start*; subsequent values are offset by intervals and floored.

### *interval*.ceil(*value*)

```js
d3.utcYear.ceil(new Date("2001-06-12"))
```

Returns the value representing the least interval boundary value greater than or equal to the specified *value*. For example, day.ceil(*date*) typically returns 12:00 AM on the date following the given date.

This method is idempotent: if the specified date is already ceilinged to the current interval, the same value is returned. Furthermore, the returned value is the maximum expressible value of the associated interval, such that ceil(ceil(*value*) + *epsilon*) returns the following interval boundary value.
