import {InternSet, extent, format, utcFormat} from "d3";
import {formatDefault} from "../format.js";
import {marks} from "../mark.js";
import {radians} from "../math.js";
import {arrayify, constant, identity, keyword, number, range, valueof} from "../options.js";
import {isIterable, isNoneish, isTemporal, isInterval} from "../options.js";
import {maybeColorChannel, maybeNumberChannel, maybeRangeInterval} from "../options.js";
import {inferScaleOrder} from "../scales.js";
import {offset} from "../style.js";
import {generalizeTimeInterval, inferTimeFormat, intervalDuration} from "../time.js";
import {initializer} from "../transforms/basic.js";
import {warn} from "../warnings.js";
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
  return axisMark(
    vectorY,
    k,
    data,
    {
      ariaLabel: `${k}-axis tick`,
      ariaHidden: true
    },
    {
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
    }
  );
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
  return axisMark(
    vectorX,
    k,
    data,
    {
      ariaLabel: `${k}-axis tick`,
      ariaHidden: true
    },
    {
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
    }
  );
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
    data,
    {ariaLabel: `${k}-axis tick label`},
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
    data,
    {ariaLabel: `${k}-axis tick label`},
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
  return axisMark(ruleY, k, data, {ariaLabel: `${k}-grid`, ariaHidden: true}, {y, x1, x2, ...gridDefaults(options)});
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
  return axisMark(ruleX, k, data, {ariaLabel: `${k}-grid`, ariaHidden: true}, {x, y1, y2, ...gridDefaults(options)});
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
    fontVariant,
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
    fontVariant,
    fontWeight,
    monospace,
    pointerEvents,
    shapeRendering,
    clip,
    initializer
  };
}

function axisMark(mark, k, data, properties, options, initialize) {
  let channels;

  function axisInitializer(data, facets, _channels, scales, dimensions, context) {
    const initializeFacets = data == null && (k === "fx" || k === "fy");
    const {[k]: scale} = scales;
    if (!scale) throw new Error(`missing scale: ${k}`);
    const domain = scale.domain();
    let {interval, ticks, tickFormat, tickSpacing = k === "x" ? 80 : 35} = options;
    // For a scale with a temporal domain, also allow the ticks to be specified
    // as a string which is promoted to a time interval. In the case of ordinal
    // scales, the interval is interpreted as UTC.
    if (typeof ticks === "string" && hasTemporalDomain(scale)) (interval = ticks), (ticks = undefined);
    // The interval axis option is an alternative method of specifying ticks;
    // for example, for a numeric scale, ticks = 5 means “about 5 ticks” whereas
    // interval = 5 means “ticks every 5 units”. (This is not to be confused
    // with the interval scale option, which affects the scale’s behavior!)
    // Lastly use the tickSpacing option to infer the desired tick count.
    if (ticks === undefined) ticks = maybeRangeInterval(interval, scale.type) ?? inferTickCount(scale, tickSpacing);
    if (data == null) {
      if (isIterable(ticks)) {
        // Use explicit ticks, if specified.
        data = arrayify(ticks);
      } else if (isInterval(ticks)) {
        // Use the tick interval, if specified.
        data = inclusiveRange(ticks, ...extent(domain));
      } else if (scale.interval) {
        // If the scale interval is a standard time interval such as "day", we
        // may be able to generalize the scale interval it to a larger aligned
        // time interval to create the desired number of ticks.
        let interval = scale.interval;
        if (scale.ticks) {
          const [min, max] = extent(domain);
          const n = (max - min) / interval[intervalDuration]; // current tick count
          // We don’t explicitly check that given interval is a time interval;
          // in that case the generalized interval will be undefined, just like
          // a nonstandard interval. TODO Generalize integer intervals, too.
          interval = generalizeTimeInterval(interval, n / ticks) ?? interval;
          data = inclusiveRange(interval, min, max);
        } else {
          data = domain;
          const n = data.length; // current tick count
          interval = generalizeTimeInterval(interval, n / ticks) ?? interval;
          if (interval !== scale.interval) data = inclusiveRange(interval, ...extent(data));
        }
        if (interval === scale.interval) {
          // If we weren’t able to generalize the scale’s interval, compute the
          // positive number n such that taking every nth value from the scale’s
          // domain produces as close as possible to the desired number of
          // ticks. For example, if the domain has 100 values and 5 ticks are
          // desired, n = 20.
          const n = Math.round(data.length / ticks);
          if (n > 1) data = data.filter((d, i) => i % n === 0);
        }
      } else if (scale.ticks) {
        data = scale.ticks(ticks);
      } else {
        // For ordinal scales, the domain will already be generated using the
        // scale’s interval, if any.
        data = domain;
      }
      if (!scale.ticks && data.length && data !== domain) {
        // For ordinal scales, intersect the ticks with the scale domain since
        // the scale is only defined on its domain. If all of the ticks are
        // removed, then warn that the ticks and scale domain may be misaligned
        // (e.g., "year" ticks and "4 weeks" interval).
        const domainSet = new InternSet(domain);
        data = data.filter((d) => domainSet.has(d));
        if (!data.length) warn(`Warning: the ${k}-axis ticks appear to not align with the scale domain, resulting in no ticks. Try different ticks?`); // prettier-ignore
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
  if (properties !== undefined) Object.assign(m, properties);
  if (m.clip === undefined) m.clip = false; // don’t clip axes by default
  return m;
}

function inferTickCount(scale, tickSpacing) {
  const [min, max] = extent(scale.range());
  return (max - min) / tickSpacing;
}

function inferTextChannel(scale, data, ticks, tickFormat, anchor) {
  return {value: inferTickFormat(scale, data, ticks, tickFormat, anchor)};
}

// D3’s ordinal scales simply use toString by default, but if the ordinal scale
// domain (or ticks) are numbers or dates (say because we’re applying a time
// interval to the ordinal scale), we want Plot’s default formatter. And for
// time ticks, we want to use the multi-line time format (e.g., Jan 26) if
// possible, or the default ISO format (2014-01-26). TODO We need a better way
// to infer whether the ordinal scale is UTC or local time.
export function inferTickFormat(scale, data, ticks, tickFormat, anchor) {
  return typeof tickFormat === "function" && !(scale.type === "log" && scale.tickFormat)
    ? tickFormat
    : tickFormat === undefined && data && isTemporal(data)
    ? inferTimeFormat(scale.type, data, anchor) ?? formatDefault
    : scale.tickFormat
    ? scale.tickFormat(typeof ticks === "number" ? ticks : null, tickFormat)
    : tickFormat === undefined
    ? formatDefault
    : typeof tickFormat === "string"
    ? (isTemporal(scale.domain()) ? utcFormat : format)(tickFormat)
    : constant(tickFormat);
}

function inclusiveRange(interval, min, max) {
  return interval.range(min, interval.offset(interval.floor(max)));
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

// Takes the scale label, and if this is not an ordinal scale and the label was
// inferred from an associated channel, adds an orientation-appropriate arrow.
function formatAxisLabel(k, scale, {anchor, label = scale.label, labelAnchor, labelArrow} = {}) {
  if (label == null || (label.inferred && hasTemporalDomain(scale) && /^(date|time|year)$/i.test(label))) return;
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

function hasTemporalDomain(scale) {
  return isTemporal(scale.domain());
}
