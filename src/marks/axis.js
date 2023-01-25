import {extent, format, utcFormat} from "d3";
import {create} from "../context.js";
import {maybeFacetAnchor} from "../facet.js";
import {formatDefault} from "../format.js";
import {Mark} from "../mark.js";
import {radians} from "../math.js";
import {range, valueof, arrayify, constant, keyword, identity} from "../options.js";
import {isNone, isNoneish, isIterable, isTemporal, maybeInterval} from "../options.js";
import {isTemporalScale} from "../scales.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {maybeTimeInterval, maybeUtcInterval} from "../time.js";
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

/** @jsdoc axisX */
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

function axisKy(
  k,
  anchor,
  data,
  {
    line,
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
    tickSize = k === "fy" ? 0 : 6,
    x1,
    x2,
    x = anchor === "left" ? x1 : x2,
    marginTop = 20,
    marginRight = anchor === "right" ? 40 : 0,
    marginBottom = 20,
    marginLeft = anchor === "left" ? 40 : 0,
    label,
    labelAnchor,
    ...options
  }
) {
  if (labelAnchor !== undefined) labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "top", "bottom"]);
  return [
    k !== "fy" && line && !isNone(line)
      ? new AxisLine(k, anchor, {
          stroke: line === true ? stroke : line,
          strokeOpacity,
          strokeWidth,
          ...options
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickKy(k, anchor, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          tickSize,
          x,
          ...options
        })
      : null,
    !isNoneish(fill)
      ? [
          axisTextKy(k, anchor, data, {
            fill,
            fillOpacity,
            stroke: textStroke,
            strokeOpacity: textStrokeOpacity,
            strokeWidth: textStrokeWidth,
            textAnchor,
            tickSize,
            x,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
            ...options
          }),
          k === "y"
            ? text([], {
                fill,
                fillOpacity,
                ...options,
                x: null,
                y: null,
                initializer: function (data, facets, channels, scales, dimensions) {
                  const scale = scales[k];
                  const {marginRight, marginLeft} = dimensions;
                  const cla = labelAnchor ?? (scale?.bandwidth ? "center" : "top");
                  if (cla === "center") {
                    this.textAnchor = undefined; // middle
                    this.lineAnchor = "top";
                    this.facetAnchor = maybeFacetAnchor(`${anchor}-middle`);
                    this.frameAnchor = anchor;
                    this.rotate = anchor === "right" ? 90 : -90;
                  } else {
                    this.textAnchor = anchor === "right" ? "end" : "start";
                    this.lineAnchor = cla === "top" ? "bottom" : "top";
                    this.facetAnchor = maybeFacetAnchor(`${cla}-${anchor}`);
                    this.frameAnchor = `${cla}-${anchor}`;
                    this.rotate = 0;
                  }
                  this.dy = cla === "top" ? -10 : cla === "bottom" ? 10 : 0;
                  this.dx = anchor === "right" ? marginRight : -marginLeft;
                  this.ariaLabel = `${k}-axis label`;
                  return {
                    facets: [[0]],
                    channels: {text: {value: [label === undefined ? scale.label : label]}}
                  };
                }
              })
            : null
        ]
      : null
  ];
}

function axisKx(
  k,
  anchor,
  data,
  {
    line,
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
    tickSize = k === "fx" ? 0 : 6,
    y1,
    y2,
    y = anchor === "bottom" ? y2 : y1,
    marginTop = anchor === "top" ? 30 : 0,
    marginRight = 20,
    marginBottom = anchor === "bottom" ? 30 : 0,
    marginLeft = 20,
    label,
    labelAnchor,
    ...options
  }
) {
  if (labelAnchor !== undefined) labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "left", "right"]);
  return [
    k !== "fx" && line && !isNone(line)
      ? new AxisLine(k, anchor, {
          stroke: line === true ? stroke : line,
          strokeOpacity,
          strokeWidth,
          ...options
        })
      : null,
    tickSize && !isNoneish(stroke)
      ? axisTickKx(k, anchor, data, {
          stroke,
          strokeOpacity,
          strokeWidth,
          tickSize,
          y,
          ...options
        })
      : null,
    !isNoneish(fill)
      ? [
          axisTextKx(k, anchor, data, {
            fill,
            fillOpacity,
            stroke: textStroke,
            strokeOpacity: textStrokeOpacity,
            strokeWidth: textStrokeWidth,
            textAnchor,
            tickSize,
            y,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
            ...options
          }),
          k === "x"
            ? text([], {
                fill,
                fillOpacity,
                ...options,
                x: null,
                y: null,
                initializer: function (data, facets, channels, scales, dimensions) {
                  const scale = scales[k];
                  const {marginRight, marginLeft} = dimensions;
                  const cla = labelAnchor ?? (scale?.bandwidth ? "center" : "right");
                  if (cla === "center") {
                    this.facetAnchor = maybeFacetAnchor(`${anchor}-middle`);
                    this.frameAnchor = anchor;
                    this.textAnchor = undefined; // middle
                  } else {
                    this.facetAnchor = maybeFacetAnchor(`${anchor}-${cla}`);
                    this.frameAnchor = `${anchor}-${cla}`;
                    this.textAnchor = cla === "right" ? "end" : "start";
                  }
                  this.lineAnchor = anchor === "top" ? "bottom" : "top";
                  this.dy = anchor === "top" ? -20 : 20; // TODO marginTop, marginBottom
                  this.dx = cla === "right" ? marginRight : cla === "left" ? -marginLeft : 0;
                  this.ariaLabel = `${k}-axis label`;
                  return {
                    facets: [[0]],
                    channels: {text: {value: [label === undefined ? scale.label : label]}}
                  };
                }
              })
            : null
        ]
      : null
  ];
}

function axisTickKy(
  k,
  anchor,
  data,
  {
    strokeWidth = 1,
    strokeLinecap = null,
    strokeLinejoin = null,
    facetAnchor = anchor + (k === "fy" ? "" : "-empty"),
    frameAnchor = anchor,
    tickSize,
    inset = 0,
    insetLeft = inset,
    insetRight = inset,
    dx = 0,
    y = k === "fy" ? null : undefined,
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
    facetAnchor = anchor + (k === "fx" ? "" : "-empty"),
    frameAnchor = anchor,
    tickSize,
    inset = 0,
    insetTop = inset,
    insetBottom = inset,
    dy = 0,
    x = k === "fx" ? null : undefined,
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
    facetAnchor = anchor + (k === "fy" ? "" : "-empty"),
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
    y = k === "fy" ? null : undefined,
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
    facetAnchor = anchor + (k === "fx" ? "" : "-empty"),
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
    x = k === "fx" ? null : undefined,
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
  return gridKy("y", data, gridDefaults(options));
}

export function gridFy() {
  const [data, {y = null, ...options}] = maybeData(...arguments);
  return gridKy("fy", data, gridDefaults({y, ...options}));
}

/** @jsdoc gridX */
export function gridX() {
  const [data, options] = maybeData(...arguments);
  return gridKx("x", data, gridDefaults(options));
}

export function gridFx() {
  const [data, {x = null, ...options}] = maybeData(...arguments);
  return gridKx("fx", data, gridDefaults({x, ...options}));
}

function gridKy(k, data, {x1 = null, x2 = null, ...options}) {
  return axisMark(ruleY, k, `${k}-grid`, data, {x1, x2, ...options});
}

function gridKx(k, data, {y1 = null, y2 = null, ...options}) {
  return axisMark(ruleX, k, `${k}-grid`, data, {y1, y2, ...options});
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

function axisMark(mark, k, ariaLabel, data, options, initialize) {
  let channels;
  const m = mark(
    data,
    initializer(options, function (data, facets, _channels, scales) {
      const {[k]: scale} = scales;
      if (!scale) throw new Error(`missing scale: ${k}`);
      let {ticks} = options;
      // TODO Again, here we need the full scale descriptor rather than just the
      // scale function: we need to know the type of the scale which cannot be
      // inferred from the function alone.
      if (isTemporalScale(scale) && typeof ticks === "string") {
        ticks = (scale.type === "time" ? maybeTimeInterval : maybeUtcInterval)(ticks);
      }
      if (data == null) {
        if (isIterable(ticks)) {
          data = arrayify(ticks);
        } else if (scale.ticks) {
          if (ticks !== undefined) {
            data = scale.ticks(ticks);
          } else {
            let {interval = scale.interval} = options;
            interval = maybeInterval(interval);
            if (interval !== undefined) {
              // For time scales, we could pass the interval directly to
              // scale.ticks because it’s supported by d3.utcTicks; but
              // quantitative scales and d3.ticks do not support numeric
              // intervals for scale.ticks, so we compute them here.
              const [min, max] = extent(scale.domain());
              data = interval.range(interval.floor(min), interval.offset(interval.floor(max)));
            } else {
              const [min, max] = extent(scale.range());
              ticks = (max - min) / (k === "x" ? 80 : 35);
              data = scale.ticks(ticks);
            }
          }
        } else {
          data = scale.domain();
        }
      }
      if (k === "fy" || k === "fx") {
        channels[k] = {scale: k, value: identity};
        facets = undefined; // computed automatically by plot
      } else {
        facets = [range(data)]; // TODO allow faceted ticks?
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
  channels = m.channels;
  m.ariaLabel = ariaLabel;
  m.channels = {};
  return m;
}

const axisLineDefaults = {
  fill: null,
  stroke: "currentColor"
};

class AxisLine extends Mark {
  constructor(k, anchor, {facetAnchor = anchor + "-empty", ...options} = {}) {
    super(undefined, undefined, {facetAnchor, ...options}, axisLineDefaults);
    this.anchor = anchor;
    this.ariaLabel = `${k}-axis line`;
  }
  render(index, scales, channels, dimensions, context) {
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {anchor} = this;
    const tx = anchor === "left" ? -0.5 : anchor === "right" ? 0.5 : undefined;
    const ty = anchor === "top" ? -0.5 : anchor === "bottom" ? 0.5 : undefined;
    return create("svg:line", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyDirectStyles, this)
      .call(applyTransform, this, {}, tx, ty)
      .attr("x1", anchor === "right" ? width - marginRight : marginLeft)
      .attr("y1", anchor === "bottom" ? height - marginBottom : marginTop)
      .attr("x2", anchor === "left" ? marginLeft : width - marginRight)
      .attr("y2", anchor === "top" ? marginTop : height - marginBottom)
      .node();
  }
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
