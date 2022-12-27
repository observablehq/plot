import {extent, format, utcFormat} from "d3";
import {inferFontVariant} from "../axes.js";
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
    frameAnchor = anchor,
    fontVariant,
    tickSize = 6,
    tickRotate = 0,
    tickPadding = 3 + (Math.abs(tickRotate) >= 10 ? 4 * Math.abs(Math.sin(tickRotate * radians)) : 0),
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : undefined,
    textAnchor = Math.abs(tickRotate) > 60 ? "middle" : anchor === "left" ? "end" : "start",
    lineAnchor = "middle",
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    x1,
    x2,
    x = anchor === "left" ? x1 : x2,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridY(data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dx,
          x1: x1 === undefined && anchor === "left" ? x : x1,
          x2: x2 === undefined && anchor === "right" ? x : x2,
          insetLeft,
          insetRight,
          ...rest
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickY(vectorY, data, {
          facetAnchor: anchor,
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          x,
          ...rest,
          dx: anchor === "left" ? +dx - offset + +insetLeft : +dx + offset - insetRight,
          anchor: "start",
          length: tickSize,
          shape: anchor === "left" ? shapeTickLeft : shapeTickRight,
          strokeLinejoin: null,
          strokeLinecap: null
        })
      : null,
    !isNoneish(fill)
      ? axisTickY(
          textY,
          data,
          {
            facetAnchor: anchor,
            fill,
            fillOpacity,
            frameAnchor,
            lineAnchor,
            textAnchor,
            text: text === undefined ? null : text,
            fontVariant,
            rotate: tickRotate,
            x,
            ...rest,
            dx:
              anchor === "left"
                ? +dx - tickSize - tickPadding + +insetLeft
                : +dx + +tickSize + +tickPadding - insetRight
          },
          function (scale, ticks) {
            if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
            if (text === undefined) this.channels.text = inferTextChannel(scale, ticks, tickFormat);
          }
        )
      : null
  );
}

export function axisX() {
  const [data, options] = maybeData(...arguments);
  const anchor = maybeAnchor(options, ["bottom", "top"]);
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
    frameAnchor = anchor,
    fontVariant,
    tickSize = 6,
    tickRotate = 0,
    tickPadding = 3 + (Math.abs(tickRotate) >= 10 ? 4 * Math.cos(tickRotate * radians) : 0),
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : undefined,
    textAnchor = Math.abs(tickRotate) >= 10 ? ((tickRotate < 0) ^ (anchor === "bottom") ? "start" : "end") : "middle",
    lineAnchor = Math.abs(tickRotate) >= 10 ? "middle" : anchor === "bottom" ? "top" : "bottom",
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    y1,
    y2,
    y = anchor === "bottom" ? y2 : y1,
    ...rest
  } = options;
  return marks(
    grid && !isNone(grid)
      ? gridX(data, {
          stroke: grid === true ? stroke : grid,
          strokeOpacity: gridOpacity,
          strokeWidth,
          dy,
          y1: y1 === undefined && anchor === "top" ? y : y1,
          y2: y2 === undefined && anchor === "bottom" ? y : y2,
          insetTop,
          insetBottom,
          ...rest
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickX(vectorX, data, {
          facetAnchor: anchor,
          stroke,
          strokeOpacity,
          strokeWidth,
          frameAnchor,
          y,
          ...rest,
          dy: anchor === "bottom" ? +dy - offset - insetBottom : +dy + offset + +insetTop,
          anchor: "start",
          length: tickSize,
          shape: anchor === "bottom" ? shapeTickBottom : shapeTickTop,
          strokeLinejoin: null,
          strokeLinecap: null
        })
      : null,
    !isNoneish(fill)
      ? axisTickX(
          textX,
          data,
          {
            facetAnchor: anchor,
            fill,
            fillOpacity,
            frameAnchor,
            lineAnchor,
            textAnchor,
            text: text === undefined ? null : text,
            fontVariant,
            rotate: tickRotate,
            y,
            ...rest,
            dy:
              anchor === "bottom"
                ? +dy + +tickSize + +tickPadding - insetBottom
                : +dy - tickSize - tickPadding + +insetTop
          },
          function (scale, ticks) {
            if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
            if (text === undefined) this.channels.text = inferTextChannel(scale, ticks, tickFormat);
          }
        )
      : null
  );
}

export function gridY() {
  const [data, options] = maybeData(...arguments);
  const {x1 = null, x2 = null, ...rest} = options;
  return axisTickY(ruleY, data, {x1, x2, ...gridDefaults(rest)});
}

export function gridX() {
  const [data, options] = maybeData(...arguments);
  const {y1 = null, y2 = null, ...rest} = options;
  return axisTickX(ruleX, data, {y1, y2, ...gridDefaults(rest)});
}

export function gridFx() {
  const [data, options] = maybeData(...arguments);
  const {x = null, y1 = null, y2 = null, ...rest} = options;
  return axisTick(ruleX, "fx", data, {x, y1, y2, ...gridDefaults(rest)});
}

export function gridFy() {
  const [data, options] = maybeData(...arguments);
  const {y = null, x1 = null, x2 = null, ...rest} = options;
  return axisTick(ruleY, "fy", data, {y, x1, x2, ...gridDefaults(rest)});
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
