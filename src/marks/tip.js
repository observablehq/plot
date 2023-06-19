import {select} from "d3";
import {getSource} from "../channel.js";
import {create} from "../context.js";
import {defined} from "../defined.js";
import {formatDefault} from "../format.js";
import {anchorX, anchorY} from "../interactions/pointer.js";
import {Mark} from "../mark.js";
import {maybeAnchor, maybeFrameAnchor, maybeTuple, number, string} from "../options.js";
import {applyDirectStyles, applyFrameAnchor, applyIndirectStyles, applyTransform, impliedString} from "../style.js";
import {identity, isIterable, isTextual} from "../options.js";
import {inferTickFormat} from "./axis.js";
import {applyIndirectTextStyles, defaultWidth, ellipsis, monospaceWidth} from "./text.js";
import {cut, clipper, splitter, maybeTextOverflow} from "./text.js";

const defaults = {
  ariaLabel: "tip",
  fill: "white",
  stroke: "currentColor"
};

// These channels are not displayed in the tip; TODO allow customization.
const ignoreChannels = new Set(["geometry", "href", "src", "ariaLabel"]);

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
      monospace,
      fontFamily = monospace ? "ui-monospace, monospace" : undefined,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      lineHeight = 1,
      lineWidth = 20,
      frameAnchor,
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
    this.previousAnchor = this.anchor ?? "top-left";
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
  }
  render(index, scales, values, dimensions, context) {
    const mark = this;
    const {x, y, fx, fy} = scales;
    const {ownerSVGElement: svg, document} = context;
    const {anchor, monospace, lineHeight, lineWidth} = this;
    const {textPadding: r, pointerSize: m, pathFilter} = this;
    const {marginTop, marginLeft} = dimensions;
    const sources = getSources(values);

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

    // We borrow the scale’s tick format for facet channels; this is safe for
    // ordinal scales (but not continuous scales where the display value may
    // need higher precision), and generally better than the default format.
    const formatFx = fx && inferTickFormat(fx);
    const formatFy = fy && inferTickFormat(fy);

    function* format(sources, i) {
      if ("title" in sources) {
        const text = sources.title.value[i];
        for (const line of mark.splitLines(formatDefault(text))) {
          yield {name: "", value: mark.clipLine(line)};
        }
        return;
      }
      for (const key in sources) {
        if (key === "x1" && "x2" in sources) continue;
        if (key === "y1" && "y2" in sources) continue;
        const channel = sources[key];
        const value = channel.value[i];
        if (!defined(value) && channel.scale == null) continue;
        if (key === "x2" && "x1" in sources) {
          yield {name: formatLabel(scales, channel, "x"), value: formatPair(sources.x1, channel, i)};
        } else if (key === "y2" && "y1" in sources) {
          yield {name: formatLabel(scales, channel, "y"), value: formatPair(sources.y1, channel, i)};
        } else {
          const scale = channel.scale;
          const line = {name: formatLabel(scales, channel, key), value: formatDefault(value)};
          if (scale === "color" || scale === "opacity") line[scale] = values[key][i];
          yield line;
        }
      }
      if (index.fi != null && fx) yield {name: String(fx.label ?? "fx"), value: formatFx(index.fx)};
      if (index.fi != null && fy) yield {name: String(fy.label ?? "fy"), value: formatFy(index.fy)};
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
              const names = new Set();
              for (const line of format(sources, i)) {
                const name = line.name;
                if (name && names.has(name)) continue;
                else names.add(name);
                renderLine(that, line);
              }
            })
          )
      );

    // Renders a single line (a name-value pair) to the tip, truncating the text
    // as needed, and adding a title if the text is truncated. Note that this is
    // just the initial layout of the text; in postrender we will compute the
    // exact text metrics and translate the text as needed once we know the
    // tip’s orientation (anchor).
    function renderLine(selection, {name, value, color, opacity}) {
      const swatch = color != null || opacity != null;
      let title;
      let w = lineWidth * 100;
      const [j] = cut(name, w, widthof, ee);
      if (j >= 0) {
        // name is truncated
        name = name.slice(0, j).trimEnd() + ellipsis;
        title = value.trim();
        value = "";
      } else {
        if (name || (!value && !swatch)) value = " " + value;
        const [k] = cut(value, w - widthof(name), widthof, ee);
        if (k >= 0) {
          // value is truncated
          value = value.slice(0, k).trimEnd() + ellipsis;
          title = value.trim();
        }
      }
      const line = selection.append("tspan").attr("x", 0).attr("dy", `${lineHeight}em`).text("\u200b"); // zwsp for double-click
      if (name) line.append("tspan").attr("font-weight", "bold").text(name);
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
          a = mark.previousAnchor; // favor the previous anchor, if it fits
          const x = px(i) + ox;
          const y = py(i) + oy;
          const fitLeft = x + w + r * 2 < width;
          const fitRight = x - w - r * 2 > 0;
          const fitTop = y + h + m + r * 2 + 7 < height;
          const fitBottom = y - h - m - r * 2 > 0;
          const ax = (/-left$/.test(a) ? fitLeft || !fitRight : fitLeft && !fitRight) ? "left" : "right";
          const ay = (/^top-/.test(a) ? fitTop || !fitBottom : fitTop && !fitBottom) ? "top" : "bottom";
          a = mark.previousAnchor = `${ay}-${ax}`;
        }
        const path = this.firstChild; // note: assumes exactly two children!
        const text = this.lastChild; // note: assumes exactly two children!
        path.setAttribute("d", getPath(a, m, r, w, h));
        if (tx) for (const t of text.childNodes) t.setAttribute("x", -tx);
        text.setAttribute("y", `${+getLineOffset(a, text.childNodes.length, lineHeight).toFixed(6)}em`);
        text.setAttribute("transform", `translate(${getTextTranslate(a, m, r, w, h)})`);
      });
    }

    // Wait until the plot is inserted into the page so that we can use getBBox
    // to compute the exact text dimensions. If the SVG is already connected, as
    // when the pointer interaction triggers the re-render, use a faster
    // microtask instead of an animation frame; if this SSR (e.g., JSDOM), skip
    // this step. Perhaps this could be done synchronously; getting the
    // dimensions of the SVG is easy, and although accurate text metrics are
    // hard, we could use approximate heuristics.
    if (svg.isConnected) Promise.resolve().then(postrender);
    else if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(postrender);

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

function getSources({channels}) {
  const sources = {};
  for (const key in channels) {
    if (ignoreChannels.has(key)) continue;
    const source = getSource(channels, key);
    if (source) sources[key] = source;
  }
  return sources;
}

function formatPair(c1, c2, i) {
  return c2.hint?.length // e.g., stackY’s y1 and y2
    ? `${formatDefault(c2.value[i] - c1.value[i])}`
    : `${formatDefault(c1.value[i])}–${formatDefault(c2.value[i])}`;
}

function formatLabel(scales, c, defaultLabel) {
  return String(scales[c.scale]?.label ?? c?.label ?? defaultLabel);
}
