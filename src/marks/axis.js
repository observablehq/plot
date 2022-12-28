import {extent, format, utcFormat} from "d3";
import {formatDefault} from "../format.js";
import {radians} from "../math.js";
import {range, valueof, arrayify, constant, keyword, identity} from "../options.js";
import {isNone, isNoneish, isIterable, isTemporal} from "../options.js";
import {marks} from "../plot.js";
import {offset} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {textX, textY} from "./text.js";
import {vectorX, vectorY} from "./vector.js";

function maybeData(data, options) {
  if (arguments.length < 2 && !isIterable(data)) (options = data), (data = null);
  if (options === undefined) options = {};
  return [data, options];
}

function maybeAnchor({anchor} = {}, anchors) {
  return anchor === undefined ? anchors[0] : keyword(anchor, "anchor", anchors);
}

export function axisY() {
  const [data, options] = maybeData(...arguments);
  const anchor = maybeAnchor(options, ["left", "right"]);
  return axisKy("y", anchor, data, options);
}

export function axisFy() {
  const [data, options] = maybeData(...arguments);
  const anchor = maybeAnchor(options, ["right", "left"]);
  return axisKy("fy", anchor, data, options);
}

export function axisX() {
  const [data, options] = maybeData(...arguments);
  const anchor = maybeAnchor(options, ["bottom", "top"]);
  return axisKx("x", anchor, data, options);
}

export function axisFx() {
  const [data, options] = maybeData(...arguments);
  const anchor = maybeAnchor(options, ["top", "bottom"]);
  return axisKx("fx", anchor, data, options);
}

function axisKy(k, anchor, data, options) {
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
    tickSize = k === "fy" ? 0 : 6,
    tickPadding = Math.max(3, 9 - tickSize),
    x1,
    x2,
    x = anchor === "left" ? x1 : x2,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridKy(k, data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          x1: x1 === undefined && anchor === "left" ? x : x1,
          x2: x2 === undefined && anchor === "right" ? x : x2,
          ...rest
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickKy(k, anchor, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          tickSize,
          x,
          ...rest
        })
      : null,
    !isNoneish(fill)
      ? axisTextKy(k, anchor, data, {
          fill,
          fillOpacity,
          tickSize,
          tickPadding,
          x,
          ...rest
        })
      : null
  );
}

function axisKx(k, anchor, data, options) {
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
    tickSize = k === "fx" ? 0 : 6,
    tickPadding = Math.max(3, 9 - tickSize),
    y1,
    y2,
    y = anchor === "bottom" ? y2 : y1,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridKx(k, data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          y1: y1 === undefined && anchor === "top" ? y : y1,
          y2: y2 === undefined && anchor === "bottom" ? y : y2,
          ...rest
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickKx(k, anchor, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          tickSize,
          y,
          ...rest
        })
      : null,
    !isNoneish(fill)
      ? axisTextKx(k, anchor, data, {
          fill,
          fillOpacity,
          tickSize,
          tickPadding,
          y,
          ...rest
        })
      : null
  );
}

function axisTickKy(k, anchor, data, options) {
  const {
    strokeWidth = 1,
    strokeLinecap = null,
    strokeLinejoin = null,
    facetAnchor = anchor,
    frameAnchor = anchor,
    tickSize,
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    x1,
    x2,
    x = anchor === "left" ? x1 : x2,
    y = k === "fy" ? null : undefined,
    ...rest
  } = options;
  return axisMark(vectorY, k, data, {
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    facetAnchor,
    frameAnchor,
    x,
    y,
    ...rest,
    dx: anchor === "left" ? +dx - offset + +insetLeft : +dx + offset - insetRight,
    anchor: "start",
    length: tickSize,
    shape: anchor === "left" ? shapeTickLeft : shapeTickRight
  });
}

function axisTickKx(k, anchor, data, options) {
  const {
    strokeWidth = 1,
    strokeLinecap = null,
    strokeLinejoin = null,
    facetAnchor = anchor,
    frameAnchor = anchor,
    tickSize,
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    y1,
    y2,
    y = anchor === "bottom" ? y2 : y1,
    x = k === "fx" ? null : undefined,
    ...rest
  } = options;
  return axisMark(vectorX, k, data, {
    strokeWidth,
    strokeLinejoin,
    strokeLinecap,
    facetAnchor,
    frameAnchor,
    x,
    y,
    ...rest,
    dy: anchor === "bottom" ? +dy - offset - insetBottom : +dy + offset + +insetTop,
    anchor: "start",
    length: tickSize,
    shape: anchor === "bottom" ? shapeTickBottom : shapeTickTop
  });
}

function axisTextKy(k, anchor, data, options) {
  const {
    facetAnchor = anchor,
    frameAnchor = anchor,
    tickSize,
    tickRotate = 0,
    tickPadding = 3 + (Math.abs(tickRotate) >= 10 ? 4 * Math.abs(Math.sin(tickRotate * radians)) : 0),
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : undefined,
    textAnchor = Math.abs(tickRotate) > 60 ? "middle" : anchor === "left" ? "end" : "start",
    lineAnchor = "middle",
    fontVariant,
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    x1,
    x2,
    x = anchor === "left" ? x1 : x2,
    y = k === "fy" ? null : undefined,
    ...rest
  } = options;
  return axisMark(
    textY,
    k,
    data,
    {
      facetAnchor,
      frameAnchor,
      text: text === undefined ? null : text,
      textAnchor,
      lineAnchor,
      fontVariant,
      rotate: tickRotate,
      x,
      y,
      ...rest,
      dx: anchor === "left" ? +dx - tickSize - tickPadding + +insetLeft : +dx + +tickSize + +tickPadding - insetRight
    },
    function (scale, ticks) {
      if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
      if (text === undefined) this.channels.text = inferTextChannel(scale, ticks, tickFormat);
    }
  );
}

function axisTextKx(k, anchor, data, options) {
  const {
    facetAnchor = anchor,
    frameAnchor = anchor,
    tickSize,
    tickRotate = 0,
    tickPadding = 3 + (Math.abs(tickRotate) >= 10 ? 4 * Math.cos(tickRotate * radians) : 0),
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : undefined,
    textAnchor = Math.abs(tickRotate) >= 10 ? ((tickRotate < 0) ^ (anchor === "bottom") ? "start" : "end") : "middle",
    lineAnchor = Math.abs(tickRotate) >= 10 ? "middle" : anchor === "bottom" ? "top" : "bottom",
    fontVariant,
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    y1,
    y2,
    x = k === "fx" ? null : undefined,
    y = anchor === "bottom" ? y2 : y1,
    ...rest
  } = options;
  return axisMark(
    textX,
    k,
    data,
    {
      facetAnchor,
      frameAnchor,
      text: text === undefined ? null : text,
      textAnchor,
      lineAnchor,
      fontVariant,
      rotate: tickRotate,
      x,
      y,
      ...rest,
      dy: anchor === "bottom" ? +dy + +tickSize + +tickPadding - insetBottom : +dy - tickSize - tickPadding + +insetTop
    },
    function (scale, ticks) {
      if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
      if (text === undefined) this.channels.text = inferTextChannel(scale, ticks, tickFormat);
    }
  );
}

export function gridY() {
  const [data, options] = maybeData(...arguments);
  return gridKy("y", data, options);
}

export function gridFy() {
  const [data, options] = maybeData(...arguments);
  return gridKy("fy", data, options);
}

export function gridX() {
  const [data, options] = maybeData(...arguments);
  return gridKx("x", data, options);
}

export function gridFx() {
  const [data, options] = maybeData(...arguments);
  return gridKx("fx", data, options);
}

function gridKy(k, data, {y = k === "fy" ? null : undefined, x1 = null, x2 = null, ...rest}) {
  return axisMark(ruleY, k, data, {y, x1, x2, ...gridDefaults(rest)});
}

function gridKx(k, data, {x = k === "fx" ? null : undefined, y1 = null, y2 = null, ...rest}) {
  return axisMark(ruleX, k, data, {x, y1, y2, ...gridDefaults(rest)});
}

function gridDefaults({
  color = "currentColor",
  opacity = 0.1,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  ...rest
}) {
  return {stroke, strokeOpacity, strokeWidth, ...rest};
}

function axisMark(mark, k, data, options, initialize) {
  return mark(
    data,
    initializer(options, function (data, facets, channels, scales) {
      const {[k]: scale} = scales;
      if (!scale) throw new Error(`missing scale: ${k}`);
      let {ticks} = options;
      if (data == null) {
        if (isIterable(ticks)) {
          data = arrayify(ticks);
        } else if (scale.ticks) {
          if (ticks === undefined) {
            const interval = scale.interval;
            if (interval !== undefined) {
              const [min, max] = extent(scale.domain());
              ticks = interval.range(interval.floor(min), interval.offset(interval.floor(max)));
            } else {
              const [min, max] = extent(scale.range());
              ticks = (max - min) / (k === "x" ? 80 : 35);
            }
          }
          data = scale.ticks(ticks);
        } else {
          data = scale.domain();
        }
      }
      if (k === "fy" || k === "fx") {
        this.channels[k] = {scale: k, value: identity};
        facets = undefined; // computed automatically by plot
      } else {
        facets = [range(data)]; // TODO allow faceted ticks?
      }
      initialize?.call(this, scale, ticks);
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

function inferTextChannel(scale, ticks, tickFormat) {
  return {value: inferTickFormat(scale, ticks, tickFormat)};
}

// D3’s ordinal scales simply use toString by default, but if the ordinal scale
// domain (or ticks) are numbers or dates (say because we’re applying a time
// interval to the ordinal scale), we want Plot’s default formatter. TODO Remove
// maybeAutoTickFormat.
function inferTickFormat(scale, ticks, tickFormat) {
  return scale.tickFormat
    ? scale.tickFormat(isIterable(ticks) ? null : ticks, tickFormat)
    : tickFormat === undefined
    ? formatDefault
    : typeof tickFormat === "string"
    ? (isTemporal(scale.domain()) ? utcFormat : format)(tickFormat)
    : constant(tickFormat);
}

const shapeTickBottom = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(0, l);
  }
};

const shapeTickTop = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(0, -l);
  }
};

const shapeTickLeft = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(-l, 0);
  }
};

const shapeTickRight = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(l, 0);
  }
};

// TODO Unify this with the other inferFontVariant; here we only have a scale
// function rather than a scale descriptor.
function inferFontVariant(scale) {
  return scale.bandwidth && scale.interval === undefined ? undefined : "tabular-nums";
}
