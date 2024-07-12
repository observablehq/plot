import {select, format as numberFormat, utcFormat} from "d3";
import {getSource} from "../channel.js";
import {create} from "../context.js";
import {defined} from "../defined.js";
import {formatDefault} from "../format.js";
import {anchorX, anchorY} from "../interactions/pointer.js";
import {Mark} from "../mark.js";
import {maybeAnchor, maybeFrameAnchor, maybeTuple, number, string} from "../options.js";
import {applyDirectStyles, applyFrameAnchor, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {identity, isIterable, isTemporal, isTextual} from "../options.js";
import {inferTickFormat} from "./axis.js";
import {applyIndirectTextStyles, defaultWidth, ellipsis, monospaceWidth} from "./text.js";
import {cut, clipper, splitter, maybeTextOverflow} from "./text.js";

const defaults = {
  ariaLabel: "tip",
  fill: "var(--plot-background)",
  stroke: "currentColor"
};

// These channels are not displayed in the default tip; see formatChannels.
const ignoreChannels = new Set(["geometry", "href", "src", "ariaLabel", "scales"]);

export class Tip extends Mark {
  constructor(data, options = {}) {
    if (options.tip) options = {...options, tip: false};
    if (options.title === undefined && isIterable(data) && isTextual(data)) options = {...options, title: identity};
    const {
      x,
      y,
      x1,
      x2,
      y1,
      y2,
      anchor,
      preferredAnchor = "bottom",
      monospace,
      fontFamily = monospace ? "ui-monospace, monospace" : undefined,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      lineHeight = 1,
      lineWidth = 20,
      frameAnchor,
      format,
      textAnchor = "start",
      textOverflow,
      textPadding = 8,
      title,
      pointerSize = 12,
      pathFilter = "drop-shadow(0 3px 4px rgba(0,0,0,0.2))"
    } = options;
    super(
      data,
      {
        x: {value: x1 != null && x2 != null ? null : x, scale: "x", optional: true}, // ignore midpoint
        y: {value: y1 != null && y2 != null ? null : y, scale: "y", optional: true}, // ignore midpoint
        x1: {value: x1, scale: "x", optional: x2 == null},
        y1: {value: y1, scale: "y", optional: y2 == null},
        x2: {value: x2, scale: "x", optional: x1 == null},
        y2: {value: y2, scale: "y", optional: y1 == null},
        title: {value: title, optional: true} // filter: defined
      },
      options,
      defaults
    );
    this.anchor = maybeAnchor(anchor, "anchor");
    this.preferredAnchor = maybeAnchor(preferredAnchor, "preferredAnchor");
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    this.textAnchor = impliedString(textAnchor, "middle");
    this.textPadding = +textPadding;
    this.pointerSize = +pointerSize;
    this.pathFilter = string(pathFilter);
    this.lineHeight = +lineHeight;
    this.lineWidth = +lineWidth;
    this.textOverflow = maybeTextOverflow(textOverflow);
    this.monospace = !!monospace;
    this.fontFamily = string(fontFamily);
    this.fontSize = number(fontSize);
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    for (const key in defaults) if (key in this.channels) this[key] = defaults[key]; // apply default even if channel
    this.splitLines = splitter(this);
    this.clipLine = clipper(this);
    this.format = typeof format === "string" || typeof format === "function" ? {title: format} : {...format}; // defensive copy before mutate; also promote nullish to empty
  }
  render(index, scales, values, dimensions, context) {
    const mark = this;
    const {x, y, fx, fy} = scales;
    const {ownerSVGElement: svg, document} = context;
    const {anchor, monospace, lineHeight, lineWidth} = this;
    const {textPadding: r, pointerSize: m, pathFilter} = this;
    const {marginTop, marginLeft} = dimensions;

    // The anchor position is the middle of x1 & y1 and x2 & y2, if available,
    // or x & y; the former is considered more specific because it’s how we
    // disable the implicit stack and interval transforms. If any dimension is
    // unspecified, we fallback to the frame anchor. We also need to know the
    // facet offsets to detect when the tip would draw outside the plot, and
    // thus we need to change the orientation.
    const {x1: X1, y1: Y1, x2: X2, y2: Y2, x: X = X1 ?? X2, y: Y = Y1 ?? Y2} = values;
    const ox = fx ? fx(index.fx) - marginLeft : 0;
    const oy = fy ? fy(index.fy) - marginTop : 0;

    // The order of precedence for the anchor position is: the middle of x1 & y1
    // and x2 & y2; or x1 & y1 (e.g., area); or lastly x & y. If a dimension is
    // unspecified, the frame anchor is used.
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const px = anchorX(values, cx);
    const py = anchorY(values, cy);

    // Resolve the text metric implementation. We may need an ellipsis for text
    // truncation, so we optimistically compute the ellipsis width.
    const widthof = monospace ? monospaceWidth : defaultWidth;
    const ee = widthof(ellipsis);

    // If there’s a title channel, display that as-is; otherwise, show multiple
    // channels as name-value pairs.
    let sources, format;
    if ("title" in values) {
      sources = getSourceChannels.call(this, {title: values.channels.title}, scales);
      format = formatTitle;
    } else {
      sources = getSourceChannels.call(this, values.channels, scales);
      format = formatChannels;
    }

    // We don’t call applyChannelStyles because we only use the channels to
    // derive the content of the tip, not its aesthetics.
    const g = create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyIndirectTextStyles, this)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("g")
          .attr("transform", (i) => `translate(${Math.round(px(i))},${Math.round(py(i))})`) // crisp edges
          .call(applyDirectStyles, this)
          .call((g) => g.append("path").attr("filter", pathFilter))
          .call((g) =>
            g.append("text").each(function (i) {
              const that = select(this);
              // prevent style inheritance (from path)
              this.setAttribute("fill", "currentColor");
              this.setAttribute("fill-opacity", 1);
              this.setAttribute("stroke", "none");
              // iteratively render each channel value
              const lines = format.call(mark, i, index, sources, scales, values);
              if (typeof lines === "string") {
                for (const line of mark.splitLines(lines)) {
                  renderLine(that, {value: mark.clipLine(line)});
                }
              } else {
                const labels = new Set();
                for (const line of lines) {
                  const {label = ""} = line;
                  if (label && labels.has(label)) continue;
                  else labels.add(label);
                  renderLine(that, line);
                }
              }
            })
          )
      );

    // Renders a single line (a name-value pair) to the tip, truncating the text
    // as needed, and adding a title if the text is truncated. Note that this is
    // just the initial layout of the text; in postrender we will compute the
    // exact text metrics and translate the text as needed once we know the
    // tip’s orientation (anchor).
    function renderLine(selection, {label, value, color, opacity}) {
      (label ??= ""), (value ??= "");
      const swatch = color != null || opacity != null;
      let title;
      let w = lineWidth * 100;
      const [j] = cut(label, w, widthof, ee);
      if (j >= 0) {
        // label is truncated
        label = label.slice(0, j).trimEnd() + ellipsis;
        title = value.trim();
        value = "";
      } else {
        if (label || (!value && !swatch)) value = " " + value;
        const [k] = cut(value, w - widthof(label), widthof, ee);
        if (k >= 0) {
          // value is truncated
          title = value.trim();
          value = value.slice(0, k).trimEnd() + ellipsis;
        }
      }
      const line = selection.append("tspan").attr("x", 0).attr("dy", `${lineHeight}em`).text("\u200b"); // zwsp for double-click
      if (label) line.append("tspan").attr("font-weight", "bold").text(label);
      if (value) line.append(() => document.createTextNode(value));
      if (swatch) line.append("tspan").text(" ■").attr("fill", color).attr("fill-opacity", opacity).style("user-select", "none"); // prettier-ignore
      if (title) line.append("title").text(title);
    }

    // Only after the plot is attached to the page can we compute the exact text
    // metrics needed to determine the tip size and orientation (anchor).
    function postrender() {
      const {width, height} = dimensions.facet ?? dimensions;
      g.selectChildren().each(function (i) {
        let {x: tx, width: w, height: h} = this.getBBox();
        (w = Math.round(w)), (h = Math.round(h)); // crisp edges
        let a = anchor; // use the specified anchor, if any
        if (a === undefined) {
          const x = px(i) + ox;
          const y = py(i) + oy;
          const fitLeft = x + w + m + r * 2 < width;
          const fitRight = x - w - m - r * 2 > 0;
          const fitTop = y + h + m + r * 2 < height;
          const fitBottom = y - h - m - r * 2 > 0;
          a =
            fitLeft && fitRight
              ? fitTop && fitBottom
                ? mark.preferredAnchor
                : fitBottom
                ? "bottom"
                : "top"
              : fitTop && fitBottom
              ? fitLeft
                ? "left"
                : "right"
              : (fitLeft || fitRight) && (fitTop || fitBottom)
              ? `${fitBottom ? "bottom" : "top"}-${fitLeft ? "left" : "right"}`
              : mark.preferredAnchor;
        }
        const path = this.firstChild; // note: assumes exactly two children!
        const text = this.lastChild; // note: assumes exactly two children!
        path.setAttribute("d", getPath(a, m, r, w, h));
        if (tx) for (const t of text.childNodes) t.setAttribute("x", -tx);
        text.setAttribute("y", `${+getLineOffset(a, text.childNodes.length, lineHeight).toFixed(6)}em`);
        text.setAttribute("transform", `translate(${getTextTranslate(a, m, r, w, h)})`);
      });
      g.attr("visibility", null);
    }

    // Wait until the plot is inserted into the page so that we can use getBBox
    // to compute the exact text dimensions. If the SVG is already connected, as
    // when the pointer interaction triggers the re-render, use a faster
    // microtask instead of an animation frame; if this SSR (e.g., JSDOM), skip
    // this step. Perhaps this could be done synchronously; getting the
    // dimensions of the SVG is easy, and although accurate text metrics are
    // hard, we could use approximate heuristics.
    if (index.length) {
      g.attr("visibility", "hidden"); // hide until postrender
      if (svg.isConnected) Promise.resolve().then(postrender);
      else if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(postrender);
    }

    return g.node();
  }
}

export function tip(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Tip(data, {...options, x, y});
}

function getLineOffset(anchor, length, lineHeight) {
  return /^top(?:-|$)/.test(anchor)
    ? 0.94 - lineHeight
    : /^bottom(?:-|$)/
    ? -0.29 - length * lineHeight
    : (length / 2) * lineHeight;
}

function getTextTranslate(anchor, m, r, width, height) {
  switch (anchor) {
    case "middle":
      return [-width / 2, height / 2];
    case "top-left":
      return [r, m + r];
    case "top":
      return [-width / 2, m / 2 + r];
    case "top-right":
      return [-width - r, m + r];
    case "right":
      return [-m / 2 - width - r, height / 2];
    case "bottom-left":
      return [r, -m - r];
    case "bottom":
      return [-width / 2, -m / 2 - r];
    case "bottom-right":
      return [-width - r, -m - r];
    case "left":
      return [r + m / 2, height / 2];
  }
}

function getPath(anchor, m, r, width, height) {
  const w = width + r * 2;
  const h = height + r * 2;
  switch (anchor) {
    case "middle":
      return `M${-w / 2},${-h / 2}h${w}v${h}h${-w}z`;
    case "top-left":
      return `M0,0l${m},${m}h${w - m}v${h}h${-w}z`;
    case "top":
      return `M0,0l${m / 2},${m / 2}h${(w - m) / 2}v${h}h${-w}v${-h}h${(w - m) / 2}z`;
    case "top-right":
      return `M0,0l${-m},${m}h${m - w}v${h}h${w}z`;
    case "right":
      return `M0,0l${-m / 2},${-m / 2}v${m / 2 - h / 2}h${-w}v${h}h${w}v${m / 2 - h / 2}z`;
    case "bottom-left":
      return `M0,0l${m},${-m}h${w - m}v${-h}h${-w}z`;
    case "bottom":
      return `M0,0l${m / 2},${-m / 2}h${(w - m) / 2}v${-h}h${-w}v${h}h${(w - m) / 2}z`;
    case "bottom-right":
      return `M0,0l${-m},${-m}h${m - w}v${-h}h${w}z`;
    case "left":
      return `M0,0l${m / 2},${-m / 2}v${m / 2 - h / 2}h${w}v${h}h${-w}v${m / 2 - h / 2}z`;
  }
}

// Note: mutates this.format!
function getSourceChannels(channels, scales) {
  const sources = {};

  // Promote x and y shorthand for paired channels (in order).
  let format = this.format;
  format = maybeExpandPairedFormat(format, channels, "x");
  format = maybeExpandPairedFormat(format, channels, "y");
  this.format = format;

  // Prioritize channels with explicit formats, in the given order.
  for (const key in format) {
    const value = format[key];
    if (value === null || value === false) {
      continue;
    } else if (key === "fx" || key === "fy") {
      sources[key] = true;
    } else {
      const source = getSource(channels, key);
      if (source) sources[key] = source;
    }
  }

  // Then fallback to all other (non-ignored) channels.
  for (const key in channels) {
    if (key in sources || key in format || ignoreChannels.has(key)) continue;
    if ((key === "x" || key === "y") && channels.geometry) continue; // ignore x & y on geo
    const source = getSource(channels, key);
    if (source) {
      // Ignore color channels if the values are all literal colors.
      if (source.scale == null && source.defaultScale === "color") continue;
      sources[key] = source;
    }
  }

  // And lastly facet channels, but only if this mark is faceted.
  if (this.facet) {
    if (scales.fx && !("fx" in format)) sources.fx = true;
    if (scales.fy && !("fy" in format)) sources.fy = true;
  }

  // Promote shorthand string formats, and materialize default formats.
  for (const key in sources) {
    const format = this.format[key];
    if (typeof format === "string") {
      const value = sources[key]?.value ?? scales[key]?.domain() ?? [];
      this.format[key] = (isTemporal(value) ? utcFormat : numberFormat)(format);
    } else if (format === undefined || format === true) {
      // For ordinal scales, the inferred tick format can be more concise, such
      // as only showing the year for yearly data.
      const scale = scales[key];
      this.format[key] = scale?.bandwidth ? inferTickFormat(scale, scale.domain()) : formatDefault;
    }
  }

  return sources;
}

// Promote x and y shorthand for paired channels, while preserving order.
function maybeExpandPairedFormat(format, channels, key) {
  if (!(key in format)) return format;
  const key1 = `${key}1`;
  const key2 = `${key}2`;
  if ((key1 in format || !(key1 in channels)) && (key2 in format || !(key2 in channels))) return format;
  const entries = Object.entries(format);
  const value = format[key];
  entries.splice(entries.findIndex(([name]) => name === key) + 1, 0, [key1, value], [key2, value]);
  return Object.fromEntries(entries);
}

function formatTitle(i, index, {title}) {
  return this.format.title(title.value[i], i);
}

function* formatChannels(i, index, channels, scales, values) {
  for (const key in channels) {
    if (key === "fx" || key === "fy") {
      yield {
        label: formatLabel(scales, channels, key),
        value: this.format[key](index[key], i)
      };
      continue;
    }
    if (key === "x1" && "x2" in channels) continue;
    if (key === "y1" && "y2" in channels) continue;
    const channel = channels[key];
    if (key === "x2" && "x1" in channels) {
      yield {
        label: formatPairLabel(scales, channels, "x"),
        value: formatPair(this.format.x2, channels.x1, channel, i)
      };
    } else if (key === "y2" && "y1" in channels) {
      yield {
        label: formatPairLabel(scales, channels, "y"),
        value: formatPair(this.format.y2, channels.y1, channel, i)
      };
    } else {
      const value = channel.value[i];
      const scale = channel.scale;
      if (!defined(value) && scale == null) continue;
      yield {
        label: formatLabel(scales, channels, key),
        value: this.format[key](value, i),
        color: scale === "color" ? values[key][i] : null,
        opacity: scale === "opacity" ? values[key][i] : null
      };
    }
  }
}

function formatPair(formatValue, c1, c2, i) {
  return c2.hint?.length // e.g., stackY’s y1 and y2
    ? `${formatValue(c2.value[i] - c1.value[i], i)}`
    : `${formatValue(c1.value[i], i)}–${formatValue(c2.value[i], i)}`;
}

function formatPairLabel(scales, channels, key) {
  const l1 = formatLabel(scales, channels, `${key}1`, key);
  const l2 = formatLabel(scales, channels, `${key}2`, key);
  return l1 === l2 ? l1 : `${l1}–${l2}`;
}

function formatLabel(scales, channels, key, defaultLabel = key) {
  const channel = channels[key];
  const scale = scales[channel?.scale ?? key];
  return String(scale?.label ?? channel?.label ?? defaultLabel);
}
