import {extent, format, utcFormat} from "d3";
import {formatDefault} from "../format.js";
import {marks} from "../mark.js";
import {radians} from "../math.js";
import {range, valueof, arrayify, constant, keyword, identity, number} from "../options.js";
import {isNoneish, isIterable, isTemporal, maybeInterval, orderof} from "../options.js";
import {isTemporalScale} from "../scales.js";
import {offset} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {text, textX, textY} from "./text.js";
import {vectorX, vectorY} from "./vector.js";

function maybeData(data, options) {
  if (arguments.length < 2 && !isIterable(data)) (options = data), (data = null);
  if (options === undefined) options = {};
  return [data, options];
}

function maybeAnchor({anchor} = {}, anchors) {
  return anchor === undefined ? anchors[0] : keyword(anchor, "anchor", anchors);
}

function anchorY(options) {
  return maybeAnchor(options, ["left", "right"]);
}

function anchorFy(options) {
  return maybeAnchor(options, ["right", "left"]);
}

function anchorX(options) {
  return maybeAnchor(options, ["bottom", "top"]);
}

function anchorFx(options) {
  return maybeAnchor(options, ["top", "bottom"]);
}

export function axisY() {
  const [data, options] = maybeData(...arguments);
  return axisKy("y", anchorY(options), data, options);
}

export function axisFy() {
  const [data, options] = maybeData(...arguments);
  return axisKy("fy", anchorFy(options), data, options);
}

export function axisX() {
  const [data, options] = maybeData(...arguments);
  return axisKx("x", anchorX(options), data, options);
}

export function axisFx() {
  const [data, options] = maybeData(...arguments);
  return axisKx("fx", anchorFx(options), data, options);
}

function axisKy(
  k,
  anchor,
  data,
  {
    color = "currentColor",
    opacity = 1,
    stroke = color,
    strokeOpacity = opacity,
    strokeWidth = 1,
    fill = color,
    fillOpacity = opacity,
    textAnchor,
    textStroke,
    textStrokeOpacity,
    textStrokeWidth,
    tickSize = k === "y" ? 6 : 0,
    tickPadding,
    tickRotate,
    x,
    marginTop = 20,
    marginRight = anchor === "right" ? 40 : 0,
    marginBottom = 20,
    marginLeft = anchor === "left" ? 40 : 0,
    label,
    labelOffset,
    labelAnchor,
    ...options
  }
) {
  tickSize = number(tickSize);
  tickPadding = number(tickPadding);
  tickRotate = number(tickRotate);
  if (labelAnchor !== undefined) labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "top", "bottom"]);
  return marks(
    tickSize && !isNoneish(stroke)
      ? axisTickKy(k, anchor, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          tickSize,
          tickPadding,
          tickRotate,
          x,
          ...options
        })
      : null,
    !isNoneish(fill)
      ? axisTextKy(k, anchor, data, {
          fill,
          fillOpacity,
          stroke: textStroke,
          strokeOpacity: textStrokeOpacity,
          strokeWidth: textStrokeWidth,
          textAnchor,
          tickSize,
          tickPadding,
          tickRotate,
          x,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
          ...options
        })
      : null,
    !isNoneish(fill) && label !== null
      ? text([], {
          fill,
          fillOpacity,
          ...options,
          lineWidth: undefined,
          textOverflow: undefined,
          facet: "super",
          x: null,
          y: null,
          initializer: function (data, facets, channels, scales, dimensions) {
            const scale = scales[k];
            const {marginTop, marginRight, marginBottom, marginLeft} = (k === "y" && dimensions.inset) || dimensions;
            const cla = labelAnchor ?? (scale.bandwidth ? "center" : "top");
            const clo = labelOffset ?? (anchor === "right" ? marginRight : marginLeft) - 3;
            if (cla === "center") {
              this.textAnchor = undefined; // middle
              this.lineAnchor = anchor === "right" ? "bottom" : "top";
              this.frameAnchor = anchor;
              this.rotate = -90;
            } else {
              this.textAnchor = anchor === "right" ? "end" : "start";
              this.lineAnchor = cla;
              this.frameAnchor = `${cla}-${anchor}`;
              this.rotate = 0;
            }
            this.dy = cla === "top" ? 3 - marginTop : cla === "bottom" ? marginBottom - 3 : 0;
            this.dx = anchor === "right" ? clo : -clo;
            this.ariaLabel = `${k}-axis label`;
            return {
              facets: [[0]],
              channels: {
                text: {
                  value: [label === undefined ? inferAxisLabel(k, scale, cla) : label]
                }
              }
            };
          }
        })
      : null
  );
}

function axisKx(
  k,
  anchor,
  data,
  {
    color = "currentColor",
    opacity = 1,
    stroke = color,
    strokeOpacity = opacity,
    strokeWidth = 1,
    fill = color,
    fillOpacity = opacity,
    textAnchor,
    textStroke,
    textStrokeOpacity,
    textStrokeWidth,
    tickSize = k === "x" ? 6 : 0,
    tickPadding,
    tickRotate,
    y,
    marginTop = anchor === "top" ? 30 : 0,
    marginRight = 20,
    marginBottom = anchor === "bottom" ? 30 : 0,
    marginLeft = 20,
    label,
    labelAnchor,
    labelOffset,
    ...options
  }
) {
  tickSize = number(tickSize);
  tickPadding = number(tickPadding);
  tickRotate = number(tickRotate);
  if (labelAnchor !== undefined) labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "left", "right"]);
  return marks(
    tickSize && !isNoneish(stroke)
      ? axisTickKx(k, anchor, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          tickSize,
          tickPadding,
          tickRotate,
          y,
          ...options
        })
      : null,
    !isNoneish(fill)
      ? axisTextKx(k, anchor, data, {
          fill,
          fillOpacity,
          stroke: textStroke,
          strokeOpacity: textStrokeOpacity,
          strokeWidth: textStrokeWidth,
          textAnchor,
          tickSize,
          tickPadding,
          tickRotate,
          y,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
          ...options
        })
      : null,
    !isNoneish(fill) && label !== null
      ? text([], {
          fill,
          fillOpacity,
          ...options,
          lineWidth: undefined,
          textOverflow: undefined,
          facet: "super",
          x: null,
          y: null,
          initializer: function (data, facets, channels, scales, dimensions) {
            const scale = scales[k];
            const {marginTop, marginRight, marginBottom, marginLeft} = (k === "x" && dimensions.inset) || dimensions;
            const cla = labelAnchor ?? (scale.bandwidth ? "center" : "right");
            const clo = labelOffset ?? (anchor === "top" ? marginTop : marginBottom) - 3;
            if (cla === "center") {
              this.frameAnchor = anchor;
              this.textAnchor = undefined; // middle
            } else {
              this.frameAnchor = `${anchor}-${cla}`;
              this.textAnchor = cla === "right" ? "end" : "start";
            }
            this.lineAnchor = anchor;
            this.dy = anchor === "top" ? -clo : clo;
            this.dx = cla === "right" ? marginRight - 3 : cla === "left" ? 3 - marginLeft : 0;
            this.ariaLabel = `${k}-axis label`;
            return {
              facets: [[0]],
              channels: {
                text: {
                  value: [label === undefined ? inferAxisLabel(k, scale, cla) : label]
                }
              }
            };
          }
        })
      : null
  );
}

function axisTickKy(
  k,
  anchor,
  data,
  {
    strokeWidth = 1,
    strokeLinecap = null,
    strokeLinejoin = null,
    facetAnchor = anchor + (k === "y" ? "-empty" : ""),
    frameAnchor = anchor,
    tickSize,
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    y = k === "y" ? undefined : null,
    ...options
  }
) {
  return axisMark(vectorY, k, `${k}-axis tick`, data, {
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    facetAnchor,
    frameAnchor,
    y,
    ...options,
    dx: anchor === "left" ? +dx - offset + +insetLeft : +dx + offset - insetRight,
    anchor: "start",
    length: tickSize,
    shape: anchor === "left" ? shapeTickLeft : shapeTickRight
  });
}

function axisTickKx(
  k,
  anchor,
  data,
  {
    strokeWidth = 1,
    strokeLinecap = null,
    strokeLinejoin = null,
    facetAnchor = anchor + (k === "x" ? "-empty" : ""),
    frameAnchor = anchor,
    tickSize,
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    x = k === "x" ? undefined : null,
    ...options
  }
) {
  return axisMark(vectorX, k, `${k}-axis tick`, data, {
    strokeWidth,
    strokeLinejoin,
    strokeLinecap,
    facetAnchor,
    frameAnchor,
    x,
    ...options,
    dy: anchor === "bottom" ? +dy - offset - insetBottom : +dy + offset + +insetTop,
    anchor: "start",
    length: tickSize,
    shape: anchor === "bottom" ? shapeTickBottom : shapeTickTop
  });
}

function axisTextKy(
  k,
  anchor,
  data,
  {
    facetAnchor = anchor + (k === "y" ? "-empty" : ""),
    frameAnchor = anchor,
    tickSize,
    tickRotate = 0,
    tickPadding = Math.max(3, 9 - tickSize) + (Math.abs(tickRotate) > 60 ? 4 * Math.cos(tickRotate * radians) : 0),
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : undefined,
    textAnchor = Math.abs(tickRotate) > 60 ? "middle" : anchor === "left" ? "end" : "start",
    lineAnchor = tickRotate > 60 ? "top" : tickRotate < -60 ? "bottom" : "middle",
    fontVariant,
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    y = k === "y" ? undefined : null,
    ...options
  }
) {
  return axisMark(
    textY,
    k,
    `${k}-axis tick label`,
    data,
    {
      facetAnchor,
      frameAnchor,
      text: text === undefined ? null : text,
      textAnchor,
      lineAnchor,
      fontVariant,
      rotate: tickRotate,
      y,
      ...options,
      dx: anchor === "left" ? +dx - tickSize - tickPadding + +insetLeft : +dx + +tickSize + +tickPadding - insetRight
    },
    function (scale, ticks, channels) {
      if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
      if (text === undefined) channels.text = inferTextChannel(scale, ticks, tickFormat);
    }
  );
}

function axisTextKx(
  k,
  anchor,
  data,
  {
    facetAnchor = anchor + (k === "x" ? "-empty" : ""),
    frameAnchor = anchor,
    tickSize,
    tickRotate = 0,
    tickPadding = Math.max(3, 9 - tickSize) + (Math.abs(tickRotate) >= 10 ? 4 * Math.cos(tickRotate * radians) : 0),
    tickFormat,
    text = typeof tickFormat === "function" ? tickFormat : undefined,
    textAnchor = Math.abs(tickRotate) >= 10 ? ((tickRotate < 0) ^ (anchor === "bottom") ? "start" : "end") : "middle",
    lineAnchor = Math.abs(tickRotate) >= 10 ? "middle" : anchor === "bottom" ? "top" : "bottom",
    fontVariant,
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    x = k === "x" ? undefined : null,
    ...options
  }
) {
  return axisMark(
    textX,
    k,
    `${k}-axis tick label`,
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
      ...options,
      dy: anchor === "bottom" ? +dy + +tickSize + +tickPadding - insetBottom : +dy - tickSize - tickPadding + +insetTop
    },
    function (scale, ticks, channels) {
      if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
      if (text === undefined) channels.text = inferTextChannel(scale, ticks, tickFormat);
    }
  );
}

export function gridY() {
  const [data, options] = maybeData(...arguments);
  return gridKy("y", anchorY(options), data, options);
}

export function gridFy() {
  const [data, options] = maybeData(...arguments);
  return gridKy("fy", anchorFy(options), data, options);
}

export function gridX() {
  const [data, options] = maybeData(...arguments);
  return gridKx("x", anchorX(options), data, options);
}

export function gridFx() {
  const [data, options] = maybeData(...arguments);
  return gridKx("fx", anchorFx(options), data, options);
}

function gridKy(
  k,
  anchor,
  data,
  {
    y = k === "y" ? undefined : null,
    x = null,
    x1 = anchor === "left" ? x : null,
    x2 = anchor === "right" ? x : null,
    ...options
  }
) {
  return axisMark(ruleY, k, `${k}-grid`, data, {y, x1, x2, ...gridDefaults(options)});
}

function gridKx(
  k,
  anchor,
  data,
  {
    x = k === "x" ? undefined : null,
    y = null,
    y1 = anchor === "top" ? y : null,
    y2 = anchor === "bottom" ? y : null,
    ...options
  }
) {
  return axisMark(ruleX, k, `${k}-grid`, data, {x, y1, y2, ...gridDefaults(options)});
}

function gridDefaults({
  color = "currentColor",
  opacity = 0.1,
  stroke = color,
  strokeOpacity = opacity,
  strokeWidth = 1,
  ...options
}) {
  return {stroke, strokeOpacity, strokeWidth, ...options};
}

function axisMark(mark, k, ariaLabel, data, options, initialize) {
  let channels;
  const m = mark(
    data,
    initializer(options, function (data, facets, _channels, scales) {
      const {[k]: scale} = scales;
      if (!scale) throw new Error(`missing scale: ${k}`);
      let {ticks, tickSpacing, interval} = options;
      if (isTemporalScale(scale) && typeof ticks === "string") (interval = ticks), (ticks = undefined);
      if (data == null) {
        if (isIterable(ticks)) {
          data = arrayify(ticks);
        } else if (scale.ticks) {
          if (ticks !== undefined) {
            data = scale.ticks(ticks);
          } else {
            interval = maybeInterval(interval === undefined ? scale.interval : interval, scale.type);
            if (interval !== undefined) {
              // For time scales, we could pass the interval directly to
              // scale.ticks because it’s supported by d3.utcTicks; but
              // quantitative scales and d3.ticks do not support numeric
              // intervals for scale.ticks, so we compute them here.
              const [min, max] = extent(scale.domain());
              data = interval.range(min, interval.offset(interval.floor(max))); // inclusive max
            } else {
              const [min, max] = extent(scale.range());
              ticks = (max - min) / (tickSpacing === undefined ? (k === "x" ? 80 : 35) : tickSpacing);
              data = scale.ticks(ticks);
            }
          }
        } else {
          data = scale.domain();
        }
        if (k === "y" || k === "x") {
          facets = [range(data)];
        } else {
          channels[k] = {scale: k, value: identity};
          facets = undefined; // computed automatically by plot
        }
      }
      initialize?.call(this, scale, ticks, channels);
      return {
        data,
        facets,
        channels: Object.fromEntries(
          Object.entries(channels).map(([name, channel]) => [name, {...channel, value: valueof(data, channel.value)}])
        )
      };
    })
  );
  if (data == null) {
    channels = m.channels;
    m.channels = {};
  } else {
    channels = {};
  }
  m.ariaLabel = ariaLabel;
  return m;
}

function inferTextChannel(scale, ticks, tickFormat) {
  return {value: inferTickFormat(scale, ticks, tickFormat)};
}

// D3’s ordinal scales simply use toString by default, but if the ordinal scale
// domain (or ticks) are numbers or dates (say because we’re applying a time
// interval to the ordinal scale), we want Plot’s default formatter.
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

// Determines whether the scale points in the “positive” (right or down) or
// “negative” (left or up) direction; if the scale order cannot be determined,
// returns NaN; used to assign an appropriate label arrow.
function inferScaleOrder(scale) {
  return Math.sign(orderof(scale.domain())) * Math.sign(orderof(scale.range()));
}

// Takes the scale label, and if this is not an ordinal scale and the label was
// inferred from an associated channel, adds an orientation-appropriate arrow.
function inferAxisLabel(key, scale, labelAnchor) {
  const label = scale.label;
  if (scale.bandwidth || !label?.inferred) return label;
  const order = inferScaleOrder(scale);
  return order
    ? key === "x" || labelAnchor === "center"
      ? (key === "x") === order < 0
        ? `← ${label}`
        : `${label} →`
      : `${order < 0 ? "↑ " : "↓ "}${label}`
    : label;
}
