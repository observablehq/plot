import {inferFontVariant} from "../axes.js";
import {range, valueof, isNone, isNoneish, isIterable, arrayify} from "../options.js";
import {marks} from "../plot.js";
import {offset} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {textX, textY} from "./text.js";
import {vectorX, vectorY} from "./vector.js";

function maybeData(data, options) {
  if (arguments.length < 2) (options = data), (data = null);
  if (options === undefined) options = {};
  return [data, options];
}

export function axisY() {
  const [data, options] = maybeData(...arguments);
  const {
    grid,
    gridOpacity = 0.1,
    color = "currentColor",
    opacity = 1,
    stroke = color,
    strokeOpacity = opacity,
    strokeWidth = 1,
    fill = color,
    fillOpacity = opacity,
    frameAnchor = "left",
    lineAnchor = "middle",
    textAnchor = "end",
    tickSize = 6,
    tickPadding = 3,
    dx = 0,
    x,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridY(data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dx,
          x1: x ?? null,
          x2: null,
          ...rest
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickY(vectorY, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          x,
          ...rest,
          dx: +dx - offset,
          anchor: "start",
          length: tickSize,
          shape: shapeTickY,
          strokeLinejoin: null,
          strokeLinecap: null
        })
      : null,
    !isNoneish(fill)
      ? axisTickY(
          textY,
          data,
          {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, x, ...rest, dx: +dx - tickSize - tickPadding},
          function (scales) {
            const {y} = scales;
            const {ticks} = options;
            this.fontVariant = inferFontVariant(y);
            this.channels.text.value = y.tickFormat(isIterable(ticks) ? undefined : ticks);
          }
        )
      : null
  );
}

export function axisX() {
  const [data, options] = maybeData(...arguments);
  const {
    grid,
    gridOpacity = 0.1,
    color = "currentColor",
    opacity = 1,
    stroke = color,
    strokeOpacity = opacity,
    strokeWidth = 1,
    fill = color,
    fillOpacity = opacity,
    frameAnchor = "bottom",
    lineAnchor = "top",
    textAnchor = "middle",
    tickSize = 6,
    tickPadding = 3,
    dy = 0,
    y,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridX(data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dy,
          y1: null,
          y2: y ?? null,
          ...rest
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickX(vectorX, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          y,
          ...rest,
          dy: +dy - offset,
          anchor: "start",
          length: tickSize,
          shape: shapeTickX,
          strokeLinejoin: null,
          strokeLinecap: null
        })
      : null,
    !isNoneish(fill)
      ? axisTickX(
          textX,
          data,
          {fill, fillOpacity, frameAnchor, lineAnchor, textAnchor, y, ...rest, dy: +dy + +tickSize + +tickPadding},
          function (scales) {
            const {x} = scales;
            const {ticks} = options;
            this.fontVariant = inferFontVariant(x);
            this.channels.text.value = x.tickFormat(isIterable(ticks) ? undefined : ticks);
          }
        )
      : null
  );
}

export function gridY() {
  const [data, options] = maybeData(...arguments);
  const {
    color = "currentColor",
    opacity = 0.1,
    stroke = color,
    strokeOpacity = opacity,
    strokeWidth = 1,
    ...rest
  } = options;
  return axisTickY(ruleY, data, {stroke, strokeOpacity, strokeWidth, ...rest});
}

export function gridX() {
  const [data, options] = maybeData(...arguments);
  const {
    color = "currentColor",
    opacity = 0.1,
    stroke = color,
    strokeOpacity = opacity,
    strokeWidth = 1,
    ...rest
  } = options;
  return axisTickX(ruleX, data, {stroke, strokeOpacity, strokeWidth, ...rest});
}

function axisTickX(mark, data, options, initialize) {
  return axisTick(mark, "x", data, options, initialize);
}

function axisTickY(mark, data, options, initialize) {
  return axisTick(mark, "y", data, options, initialize);
}

function axisTick(mark, k, data, options, initialize) {
  return mark(
    data,
    initializer(options, function (data, facets, channels, scales) {
      initialize?.call(this, scales);
      if (data == null) {
        const {[k]: scale} = scales;
        const {ticks} = options;
        data = isIterable(ticks) ? arrayify(ticks) : scale.ticks(ticks);
        facets = [range(data)];
      }
      return {
        data,
        facets,
        channels: Object.fromEntries(
          Object.entries(this.channels).map(([name, channel]) => [
            name,
            {...channel, value: valueof(data, channel.value)}
          ])
        )
      };
    })
  );
}

const shapeTickX = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(0, l);
  }
};

const shapeTickY = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(-l, 0);
  }
};
