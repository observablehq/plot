### Time options

Each mark can index its data by time and animate the chart from one keyframe to
the next. When possible, it maintains object consistency by interpolating the
values of the same object between keyframes.

The **time** option in a mark specifies the time channel for that mark, and
defaults to null. Its values can be dates, numbers, or even ordinal
("yesterday", "today", "tomorrow"…)

The **key** option specifies the key channel, and defaults to the index of the
datum for its time—in other words, given a repetitive array of data, Plot will
interpolate the first line for each date as one object, the second line for each
date as another object, etc.

The layout (positions, colors…) of each keyframe are computed independently, and
any data transforms are only aware of the tranche of data corresponding to that
keyframe.

Plot draws each time-aware mark, for any given time, by locating the preceding
and following keyframes. It matches the objects which have the same *key*, and
considers those which have no counterpart to be either *exiting* (if they belong
to the preceding keyframe) or *entering* (if they belong to the following
keyframe). A new set of channels is derived, with indices that contains all the
original data points plus an appendix with additional exit, update and enter
indices, that point to interpolated values.

The interpolated values for the *exit* points are equal to the corresponding
values in the preceding keyframe, except for the opacity channel, which goes
from 1 when the time is very close to the preceding time to 0 when it is close
to the following time. Conversely, the interpolated values for the *enter*
points are equal to the corresponding values in the following keyframe, except
for the opacity channel, which goes from 0 when the time is very close to the
preceding time to 1 when it is close to the following time.

The values for the *update* index are interpolated linearly in screen space,
between the value for the matching object at the preceding keyframe and the
value for the matching object at the following keyframe.

Each channel has its own interpolator, which can be specified by the **tween**
option, which is either a tweening function or an object where keys are channel
names (such as text, x, x1…), and values are tweening function. A tweening
function receives as arguments the previous and the next values *a* and *b*, and
must return a function of *t* that is equal to *a* for *t*=0 and equal to *b*
for *t*=1.

TODO: shelve specific tweens for now.

The default interpolator depends on the type of the value:
- position channels default to [number
  interpolation](https://github.com/d3/d3-interpolate/blob/main/README.md#interpolateHsl).
- color channels default to [HSL
  interpolation](https://github.com/d3/d3-interpolate/blob/main/README.md#interpolateHsl).
- a text channel defaults to "first value" (*a*) if *a* or *b* are text values;
  it defaults to number interpolation if *a* or *b* are fractional numbers, or
  if they differ by less that a few units; and it defaults to [round number
  interpolation](https://github.com/d3/d3-interpolate/blob/main/README.md#interpolateRound)
  if the two values are integers with a larger difference.

What the mark displays depends on the **timeFilter** option, which defaults to
"eq".

The support timeFilter options are:

- **eq** (default) - displays the values with a time equal to the current time
- **lte** - displays the values with a time lower than or equal to the current
  time (the "past")
- **gte** - displays the values with a time greater than or equal to the current
  time (the "future")

TODO: Some transforms do not propagate nor generate a correct *key* channel.
They should be fixed or throw an error.

TODO: A Plot.binTime transform with cumulative effect.

TODO: scale/axis transition.


### Animation options

The top-level **time** option controls the time scale and animation parameters.
The following parameters are supported:

TODO: add scale options (domain, type, exponent…)

- **duration** - the duration of the animation to cover the whole time domain,
  in milliseconds; defaults to 5000
- **direction** - specifies the direction of the playback: forward (positive) or
  backward (neggative); defaults to 1
- **playbackRate** - the rate at which the animation is played; redundant with
  the duration and direction (a playbackRate of 0.5 results in a twice longer
  duration, and a negative playbackRate results in the opposite direction)
- **initial** - specifies the time at which the animation starts (must be valid
  in the time domain); defaults to the start of time if the animation if played
  forwards, and the end of time if played backwards
- **autoplay** - a boolean that specifies if the animation should start when the
  chart is created; defaults to true
- **delay** - the delay before the animation autoplays, in milliseconds;
  defaults to 0
- **iterations** - if specified, the number of iterations before the animation
  stops
- **loop** - a boolean indicating if the animation loops; defaults to true if
  the number of iterations is positive, false otherwise
- **alternate** - a boolean indicating if every even iteration should be played
  backwards, defaults to false
- **loopDelay** - the delay between two iterations, in milliseconds; defaults to
  1000

TODO: prefer Web animation API

Some of these options correspond to the [HTMLMediaElement
API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement). When a
figure has a time channel, the following properties can be used to
programmatically control the animation.

- **currentTime** - the current time, a value in the time domain; this property
  is both readable and writable; note that in the case of ordinal time, this
  indicates the time of the preceding keyframe
- **timeupdate** - a [timeupdate
  event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event)
  is fired when the currentTime has been updated
- **play** - a function to start the animation. It returns a Promise that
  resolves immediately
- **pause** - a function to pause the animation
- **paused** - a readable boolean indicating whether the animation is paused
- **ended** - a readable boolean indicating whether the animation is ended
- **duration** - a readable number indicating the duration in seconds (not
  milliseconds!) TODO: should all durations/delays be in seconds?
- **playbackRate** - the playback rate, as a readable and writable number;
  defaults to 1, negative if played in reverse
- **loop** - a readable and writable boolean indicating if the animation loops
