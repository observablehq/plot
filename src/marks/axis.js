import {format, utcFormat} from "d3";
import {inferFontVariant} from "../axes.js";
import {formatIsoDate} from "../format.js";
import {range, valueof, isNone, isNoneish, isIterable, arrayify, isTemporal, string, constant} from "../options.js";
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
    fontVariant,
    tickSize = 6,
    tickPadding = 3,
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : null,
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    x1,
    x = x1,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridY(data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dx,
          x1: x1 === undefined ? x ?? null : x1,
          x2: null,
          insetLeft,
          insetRight,
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
          dx: +dx - offset + +insetLeft, // TODO or insetRight?
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
          {
            fill,
            fillOpacity,
            frameAnchor,
            lineAnchor,
            textAnchor,
            text,
            fontVariant,
            x,
            ...rest,
            dx: +dx - tickSize - tickPadding + +insetLeft // TODO or insetRight?
          },
          function (scales) {
            const {y} = scales;
            if (fontVariant === undefined) this.fontVariant = inferFontVariant(y);
            if (!this.channels.text) this.channels.text = inferTextChannel(y, options);
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
    fontVariant,
    tickSize = 6,
    tickPadding = 3,
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : null,
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    y2,
    y = y2,
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
          y2: y2 === undefined ? y ?? null : y2,
          insetTop,
          insetBottom,
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
          dy: +dy - offset - insetBottom, // TODO or insetTop?
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
          {
            fill,
            fillOpacity,
            frameAnchor,
            lineAnchor,
            textAnchor,
            fontVariant,
            y,
            text,
            ...rest,
            dy: +dy + +tickSize + +tickPadding - insetBottom // TODO or insetTop?
          },
          function (scales) {
            const {x} = scales;
            if (fontVariant === undefined) this.fontVariant = inferFontVariant(x);
            if (!this.channels.text) this.channels.text = inferTextChannel(x, options);
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
        data = isIterable(ticks) ? arrayify(ticks) : scale.ticks(ticks); // TODO consider dimensions
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

function inferTextChannel(scale, options) {
  return {value: inferTickFormat(scale, options)};
}

// TODO Remove maybeAutoTickFormat.
function inferTickFormat(scale, {ticks, tickFormat}) {
  if (scale.tickFormat) return scale.tickFormat(isIterable(ticks) ? null : ticks, tickFormat);
  const temporal = isTemporal(scale.domain());
  if (tickFormat === undefined) return temporal ? formatIsoDate : string;
  if (typeof tickFormat === "string") return (temporal ? utcFormat : format)(tickFormat);
  return constant(tickFormat);
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
