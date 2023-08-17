import {extent, format, timeFormat, union, utcFormat} from "d3";
import {formatDefault} from "../format.js";
import {marks} from "../mark.js";
import {radians} from "../math.js";
import {arrayify, constant, identity, keyword, number, range, valueof} from "../options.js";
import {isIterable, isNoneish, isTemporal, isInterval, isTimeInterval, orderof} from "../options.js";
import {maybeColorChannel, maybeNumberChannel, maybeRangeInterval} from "../options.js";
import {isTemporalScale} from "../scales.js";
import {offset} from "../style.js";
import {formatTimeTicks, inferTimeFormat2, isTimeYear, isUtcYear} from "../time.js";
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
    margin,
    marginTop = margin === undefined ? 20 : margin,
    marginRight = margin === undefined ? (anchor === "right" ? 40 : 0) : margin,
    marginBottom = margin === undefined ? 20 : margin,
    marginLeft = margin === undefined ? (anchor === "left" ? 40 : 0) : margin,
    label,
    labelAnchor,
    labelArrow,
    labelOffset,
    ...options
  }
) {
  tickSize = number(tickSize);
  tickPadding = number(tickPadding);
  tickRotate = number(tickRotate);
  if (labelAnchor !== undefined) labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "top", "bottom"]);
  labelArrow = maybeLabelArrow(labelArrow);
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
      ? text(
          [],
          labelOptions({fill, fillOpacity, ...options}, function (data, facets, channels, scales, dimensions) {
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
              channels: {text: {value: [formatAxisLabel(k, scale, {anchor, label, labelAnchor: cla, labelArrow})]}}
            };
          })
        )
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
    margin,
    marginTop = margin === undefined ? (anchor === "top" ? 30 : 0) : margin,
    marginRight = margin === undefined ? 20 : margin,
    marginBottom = margin === undefined ? (anchor === "bottom" ? 30 : 0) : margin,
    marginLeft = margin === undefined ? 20 : margin,
    label,
    labelAnchor,
    labelArrow,
    labelOffset,
    ...options
  }
) {
  tickSize = number(tickSize);
  tickPadding = number(tickPadding);
  tickRotate = number(tickRotate);
  if (labelAnchor !== undefined) labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "left", "right"]);
  labelArrow = maybeLabelArrow(labelArrow);
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
      ? text(
          [],
          labelOptions({fill, fillOpacity, ...options}, function (data, facets, channels, scales, dimensions) {
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
              channels: {text: {value: [formatAxisLabel(k, scale, {anchor, label, labelAnchor: cla, labelArrow})]}}
            };
          })
        )
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
  return axisMark(vectorY, k, anchor, `${k}-axis tick`, data, {
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
  return axisMark(vectorX, k, anchor, `${k}-axis tick`, data, {
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
    text,
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
    anchor,
    `${k}-axis tick label`,
    data,
    {
      facetAnchor,
      frameAnchor,
      text,
      textAnchor,
      lineAnchor,
      fontVariant,
      rotate: tickRotate,
      y,
      ...options,
      dx: anchor === "left" ? +dx - tickSize - tickPadding + +insetLeft : +dx + +tickSize + +tickPadding - insetRight
    },
    function (scale, data, ticks, tickFormat, channels) {
      if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
      if (text === undefined) channels.text = inferTextChannel(scale, data, ticks, tickFormat, anchor);
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
    text,
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
    anchor,
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
    function (scale, data, ticks, tickFormat, channels) {
      if (fontVariant === undefined) this.fontVariant = inferFontVariant(scale);
      if (text === undefined) channels.text = inferTextChannel(scale, data, ticks, tickFormat, anchor);
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
  return axisMark(ruleY, k, anchor, `${k}-grid`, data, {y, x1, x2, ...gridDefaults(options)});
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
  return axisMark(ruleX, k, anchor, `${k}-grid`, data, {x, y1, y2, ...gridDefaults(options)});
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

function labelOptions(
  {
    fill,
    fillOpacity,
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    monospace,
    pointerEvents,
    shapeRendering,
    clip = false
  },
  initializer
) {
  // Only propagate these options if constant.
  [, fill] = maybeColorChannel(fill);
  [, fillOpacity] = maybeNumberChannel(fillOpacity);
  return {
    facet: "super",
    x: null,
    y: null,
    fill,
    fillOpacity,
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    monospace,
    pointerEvents,
    shapeRendering,
    clip,
    initializer
  };
}

function axisMark(mark, k, anchor, ariaLabel, data, options, initialize) {
  let channels;

  function axisInitializer(data, facets, _channels, scales, dimensions, context) {
    const initializeFacets = data == null && (k === "fx" || k === "fy");
    const {[k]: scale} = scales;
    if (!scale) throw new Error(`missing scale: ${k}`);
    let {ticks, tickFormat, interval} = options;
    // TODO what if ticks is a time interval implementation?
    // TODO allow ticks to be a function?
    if (hasTimeTicks(scale) && typeof ticks === "string") (interval = ticks), (ticks = undefined);
    if (data == null) {
      if (isIterable(ticks)) {
        data = arrayify(ticks);
      } else if (scale.ticks) {
        if (ticks !== undefined) {
          data = scale.ticks(ticks);
        } else {
          interval = maybeRangeInterval(interval === undefined ? scale.interval : interval, scale.type);
          if (interval !== undefined) {
            // For time scales, we could pass the interval directly to
            // scale.ticks because it’s supported by d3.utcTicks; but
            // quantitative scales and d3.ticks do not support numeric
            // intervals for scale.ticks, so we compute them here.
            const [min, max] = extent(scale.domain());
            data = interval.range(min, interval.offset(interval.floor(max))); // inclusive max
          } else {
            ticks = inferTickCount(k, scale, options);
            data = scale.ticks(ticks);
          }
        }
      } else {
        data = scale.domain();
        if (isInterval(scale.interval)) {
          // If a tick interval (the ticks option) is specified on an ordinal
          // scale with an interval, we use the tick interval to generate the
          // ticks. However, the tick interval may be incompatible with the
          // scale interval, and if so, the time format inferred from the
          // subsequent ticks may not be specific enough. For example, if the
          // scale’s interval is "4 weeks" and the tick interval is "year",
          // ticks are on Sunday near the beginning of each year; however, the
          // "day" format (e.g., "Jan 26") derived from the "4 weeks" scale
          // interval does not show the year, and hence is not a good choice for
          // yearly ticks; hence we use the default format (2014-01-26) instead.
          let compatible = true;
          if (interval != null) {
            const [start, stop] = extent(data);
            data = maybeRangeInterval(interval).range(start, +stop + 1); // inclusive stop
            compatible = data.every((d) => scale.interval.floor(d) >= d);
            if (!compatible) data = [...union(data.map(scale.interval.ceil, scale.interval))];
          }
          // TODO We only need to compute the tickFormat for text; we don’t need
          // this for rules and vectors. TODO We could also consider skipping
          // ticks when the scale doesn’t have an associated interval? That
          // loses information, but maybe it’s better than having overlapping
          // ticks that are unreadable?
          if (tickFormat === undefined) {
            let format = formatDefault;
            if (isTimeInterval(scale.interval) && compatible) format = inferTimeFormat2(data, anchor);
            if (ticks === undefined) ticks = inferTickCount(k, scale, options);
            const n = Math.round(getSkip(data, ticks)); // TODO floor?
            const j = 0; // TODO choose j to align with a standard time interval, if possible
            tickFormat = n > 0 ? (d, i, D) => (i % n === j ? format(d, i, D, n) : null) : format;
          }
        }
      }
      if (k === "y" || k === "x") {
        facets = [range(data)];
      } else {
        channels[k] = {scale: k, value: identity};
      }
    }
    initialize?.call(this, scale, data, ticks, tickFormat, channels);
    const initializedChannels = Object.fromEntries(
      Object.entries(channels).map(([name, channel]) => {
        return [name, {...channel, value: valueof(data, channel.value)}];
      })
    );
    if (initializeFacets) facets = context.filterFacets(data, initializedChannels);
    return {data, facets, channels: initializedChannels};
  }

  // Apply any basic initializers after the axis initializer computes the ticks.
  const basicInitializer = initializer(options).initializer;
  const m = mark(data, initializer({...options, initializer: axisInitializer}, basicInitializer));
  if (data == null) {
    channels = m.channels;
    m.channels = {};
  } else {
    channels = {};
  }
  m.ariaLabel = ariaLabel;
  if (m.clip === undefined) m.clip = false; // don’t clip axes by default
  return m;
}

// Compute the positive number n such that taking every nth value from the
// scale’s domain produces as close as possible to the desired number of ticks.
// For example, if the domain has 100 values and 5 ticks are desired, n = 20.
function getSkip(domain, ticks) {
  return domain.length / ticks;
}

// Compute the median step s between adjacent values from the scale’s domain.
// function getMedianStep(domain) {
//   return median(pairs(domain, (a, b) => Math.abs(b - a) || NaN));
// }

function inferTickCount(k, scale, options) {
  const {tickSpacing = k === "x" ? 80 : 35} = options;
  const [min, max] = extent(scale.range());
  return (max - min) / tickSpacing;
}

// Returns true if the given interval subsumes (i.e., covers, is
// capable of generating) all of the specified values.
// function isSubsumingInterval(interval, values) {
//   return values.every((v) => interval.floor(v) >= v);
// }

function inferTextChannel(scale, data, ticks, tickFormat, anchor) {
  return {
    value: typeof tickFormat === "function" ? tickFormat : inferTickFormat(scale, data, ticks, tickFormat, anchor)
  };
}

// D3’s ordinal scales simply use toString by default, but if the ordinal scale
// domain (or ticks) are numbers or dates (say because we’re applying a time
// interval to the ordinal scale), we want Plot’s default formatter.
export function inferTickFormat(scale, data, ticks, tickFormat, anchor) {
  return tickFormat === undefined && isTemporalScale(scale)
    ? formatTimeTicks(scale, data, ticks, anchor)
    : scale.tickFormat
    ? scale.tickFormat(isIterable(ticks) ? null : ticks, tickFormat)
    : tickFormat === undefined
    ? isUtcYear(scale.interval)
      ? utcFormat("%Y")
      : isTimeYear(scale.interval)
      ? timeFormat("%Y")
      : formatDefault
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
  return scale.bandwidth && !scale.interval ? undefined : "tabular-nums";
}

// Determines whether the scale points in the “positive” (right or down) or
// “negative” (left or up) direction; if the scale order cannot be determined,
// returns NaN; used to assign an appropriate label arrow.
function inferScaleOrder(scale) {
  return Math.sign(orderof(scale.domain())) * Math.sign(orderof(scale.range()));
}

// Takes the scale label, and if this is not an ordinal scale and the label was
// inferred from an associated channel, adds an orientation-appropriate arrow.
function formatAxisLabel(k, scale, {anchor, label = scale.label, labelAnchor, labelArrow} = {}) {
  if (label == null || (label.inferred && hasTimeTicks(scale) && /^(date|time|year)$/i.test(label))) return;
  label = String(label); // coerce to a string after checking if inferred
  if (labelArrow === "auto") labelArrow = (!scale.bandwidth || scale.interval) && !/[↑↓→←]/.test(label);
  if (!labelArrow) return label;
  if (labelArrow === true) {
    const order = inferScaleOrder(scale);
    if (order)
      labelArrow =
        /x$/.test(k) || labelAnchor === "center"
          ? /x$/.test(k) === order < 0
            ? "left"
            : "right"
          : order < 0
          ? "up"
          : "down";
  }
  switch (labelArrow) {
    case "left":
      return `← ${label}`;
    case "right":
      return `${label} →`;
    case "up":
      return anchor === "right" ? `${label} ↑` : `↑ ${label}`;
    case "down":
      return anchor === "right" ? `${label} ↓` : `↓ ${label}`;
  }
  return label;
}

function maybeLabelArrow(labelArrow = "auto") {
  return isNoneish(labelArrow)
    ? false
    : typeof labelArrow === "boolean"
    ? labelArrow
    : keyword(labelArrow, "labelArrow", ["auto", "up", "right", "down", "left"]);
}

function hasTimeTicks(scale) {
  return isTemporalScale(scale) || isTimeInterval(scale.interval);
}
