import {pointer, select} from "d3";
import {formatDefault} from "../format.js";
import {Mark} from "../mark.js";
import {keyword, maybeFrameAnchor, maybeKeyword, maybeTuple, number, string} from "../options.js";
import {applyFrameAnchor} from "../style.js";
import {inferTickFormat} from "./axis.js";
import {applyIndirectTextStyles, cut, defaultWidth, monospaceWidth} from "./text.js";

const defaults = {
  ariaLabel: "tooltip",
  fill: "none",
  stroke: "none"
};

export class Tooltip extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y,
      x1,
      x2,
      y1,
      y2,
      maxRadius = 40,
      axis,
      corner,
      monospace,
      fontFamily = monospace ? "ui-monospace, monospace" : undefined,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      lineHeight = 1,
      lineWidth = 20,
      frameAnchor
    } = options;
    super(
      data,
      {
        x: {value: x1 != null && x2 != null ? null : x, scale: "x", optional: true}, // ignore midpoint
        y: {value: y1 != null && y2 != null ? null : y, scale: "y", optional: true}, // ignore midpoint
        x1: {value: x1, scale: "x", optional: x2 == null},
        y1: {value: y1, scale: "y", optional: y2 == null},
        x2: {value: x2, scale: "x", optional: x1 == null},
        y2: {value: y2, scale: "y", optional: y1 == null}
      },
      options,
      defaults
    );
    this.axis = maybeAxis(axis);
    this.corner = maybeCorner(corner);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    this.indexesBySvg = new WeakMap();
    this.textAnchor = "start"; // TODO option?
    this.lineHeight = +lineHeight;
    this.lineWidth = +lineWidth;
    this.monospace = !!monospace;
    this.fontFamily = string(fontFamily);
    this.fontSize = number(fontSize);
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.maxRadius = +maxRadius;
  }
  render(index, scales, {x: X, y: Y, x1: X1, y1: Y1, x2: X2, y2: Y2, channels}, dimensions, context) {
    // When faceting, only render this mark once. TODO We could use
    // “super-faceting” to render this mark only once, perhaps, but we still
    // want to compute faceted channels…
    const svg = context.ownerSVGElement;
    let indexes = this.indexesBySvg.get(svg);
    if (indexes) return void indexes.push(index);
    this.indexesBySvg.set(svg, (indexes = [index]));

    const {fx, fy} = scales;
    const formatFx = fx && inferTickFormat(fx);
    const formatFy = fy && inferTickFormat(fy);
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const {axis, corner, monospace, lineHeight, lineWidth, maxRadius, fx: fxv, fy: fyv} = this;
    const widthof = monospace ? monospaceWidth : defaultWidth;
    const {marginLeft, marginTop} = dimensions;
    const ellipsis = "…";
    const ee = widthof(ellipsis);
    const r = 8; // “padding”
    const m = 12; // “margin” (flag size)
    const foreground = "black"; // TODO fill option?
    const background = "white"; // TODO stroke option?
    const kx = axis === "y" ? 1 / 100 : 1;
    const ky = axis === "x" ? 1 / 100 : 1;
    let i, xi, yi; // currently-focused index and position
    let c = corner; // last-used corner (for stability)
    let sticky = false;

    function pointermove(event) {
      if (sticky) return;
      if (event.buttons === 1) return; // dragging
      const rect = svg.getBoundingClientRect();
      let ii, fxi, fyi;
      if (
        // Check if the pointer is near before scanning.
        event.clientX + maxRadius > rect.left &&
        event.clientX - maxRadius < rect.right &&
        event.clientY + maxRadius > rect.top &&
        event.clientY - maxRadius < rect.bottom
      ) {
        const [xp, yp] = pointer(event, svg);
        let ri = maxRadius * maxRadius;
        for (const index of indexes) {
          const fxj = index.fx;
          const fyj = index.fy;
          const oxj = fx ? fx(fxj) - marginLeft : 0;
          const oyj = fy ? fy(fyj) - marginTop : 0;
          for (const j of index) {
            const xj = (X2 ? (X1[j] + X2[j]) / 2 : X ? X[j] : cx) + oxj;
            const yj = (Y2 ? (Y1[j] + Y2[j]) / 2 : Y ? Y[j] : cy) + oyj;
            const dx = kx * (xj - xp);
            const dy = ky * (yj - yp);
            const rj = dx * dx + dy * dy;
            if (rj <= ri) (ii = j), (ri = rj), (xi = xj), (yi = yj), (fxi = fxj), (fyi = fyj);
          }
        }
      }
      if (i === ii) return; // abort if the tooltip hasn’t moved
      i = ii;
      if (i === undefined) {
        dot.attr("display", "none");
      } else {
        dot.attr("display", "inline");
        dot.attr("transform", `translate(${Math.round(xi)},${Math.round(yi)})`);
        const text = [];
        for (const key in channels) {
          const channel = getSource(channels, key);
          if (!channel) continue; // e.g., dodgeY’s y
          const channel1 = getSource1(channels, key);
          if (channel1) continue; // already displayed
          const channel2 = getSource2(channels, key);
          const value1 = channel.value[i];
          const value2 = channel2?.value[i];
          text.push([
            scales[channel.scale]?.label ?? key,
            channel2
              ? channel2.hint?.length
                ? `${formatDefault(value2 - value1)}`
                : `${formatDefault(value1)}–${formatDefault(value2)}`
              : formatDefault(value1)
          ]);
        }
        if (fxv != null) text.push([fx.label ?? "fx", formatFx(fxi)]);
        if (fyv != null) text.push([fy.label ?? "fy", formatFy(fyi)]);
        for (const line of text) {
          let w = lineWidth * 100;
          let [name, value] = line;
          line[0] = name = String(name).trim();
          line[1] = value = ` ${String(value).trim()}\u200b`; // zwsp for double-click
          const [i] = cut(name, w, widthof, ee);
          if (i >= 0) {
            // name is truncated
            line[0] = name.slice(0, i).trimEnd() + ellipsis;
            line[1] = "";
            line[2] = value.trim();
          } else {
            const [j] = cut(value, w - widthof(name), widthof, ee);
            if (j >= 0) {
              // value is truncated
              line[1] = value.slice(0, j).trimEnd() + ellipsis;
              line[2] = value.trim();
            }
          }
        }
        const tspan = content
          .selectChildren()
          .data(text)
          .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * lineHeight}em`);
        tspan
          .selectChildren()
          .data((d) => d.slice(0, 2))
          .join("tspan")
          .attr("font-weight", (d, i) => (i ? null : "bold"))
          .text(String);
        tspan
          .selectAll("title")
          .data((d) => (d.length > 2 ? [d[2]] : []))
          .join("title")
          .text(String);
        const {width: w, height: h} = content.node().getBBox();
        const {width, height} = svg.getBBox();
        if (corner === undefined) {
          const cx = (/-left$/.test(c) ? xi + w + r * 2 > width : xi - w - r * 2 > 0) ? "right" : "left";
          const cy = (/^top-/.test(c) ? yi + h + m + r * 2 + 7 > height : yi - h - m - r * 2 > 0) ? "bottom" : "top";
          c = `${cy}-${cx}`;
        }
        const oy = getLineOffset(c, text) * lineHeight;
        tspan.attr("y", (d, i) => `${i * lineHeight + oy}em`);
        path.attr("d", getPath(c, m, r, w, h));
        content.attr("transform", getTextTransform(c, m, r, w, h));
      }
    }

    function pointerdown() {
      if (sticky) {
        sticky = false;
        dot.attr("display", "none");
        dot.attr("pointer-events", "none");
      } else if (i !== undefined) {
        sticky = true;
        dot.attr("pointer-events", "all");
      }
    }

    function pointerleave() {
      if (!sticky) {
        dot.attr("display", "none");
        dot.attr("pointer-events", "none");
      }
    }

    // We listen to the svg element; listening to the window instead would let
    // us receive pointer events from farther away, but would also make it hard
    // to know when to remove the listeners. (Using a mutation observer to watch
    // the entire document is likely too expensive.)
    svg.addEventListener("pointermove", pointermove);
    svg.addEventListener("pointerdown", pointerdown);
    svg.addEventListener("pointerleave", pointerleave);

    const dot = select(svg)
      .append("g")
      .attr("aria-label", "tooltip")
      .attr("pointer-events", "none") // initially not sticky
      .attr("display", "none");

    const path = dot
      .append("path")
      .attr("fill", background)
      .attr("stroke", foreground)
      .attr("filter", "drop-shadow(0 3px 4px rgba(0,0,0,0.2))")
      .on("pointerdown pointermove", stopPropagation);

    const content = dot
      .append("text")
      .attr("fill", foreground)
      .call(applyIndirectTextStyles, this)
      .on("pointerdown pointermove", stopPropagation);

    return null;
  }
}

export function tooltip(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Tooltip(data, {...options, x, y});
}

function maybeAxis(value = "xy") {
  return keyword(value, "axis", ["x", "y", "xy"]);
}

function maybeCorner(value) {
  return maybeKeyword(value, "corner", ["top-left", "top-right", "bottom-right", "bottom-left"]);
}

function getSource(channels, key) {
  let channel = channels[key];
  if (!channel) return;
  while (channel.source) channel = channel.source;
  return channel.source === null ? null : channel;
}

function getSource1(channels, key) {
  return key === "x2" ? getSource(channels, "x1") : key === "y2" ? getSource(channels, "y1") : null;
}

function getSource2(channels, key) {
  return key === "x1" ? getSource(channels, "x2") : key === "y1" ? getSource(channels, "y2") : null;
}

function getLineOffset(corner, text) {
  return /^top-/.test(corner) ? 0.94 : 0.71 - text.length;
}

function getTextTransform(corner, m, r, width) {
  const x = /-left$/.test(corner) ? r : -width - r;
  const y = /^top-/.test(corner) ? m + r : -m - r;
  return `translate(${x},${y})`;
}

function getPath(corner, m, r, width, height) {
  const w = width + r * 2;
  const h = height + r * 2;
  switch (corner) {
    case "top-left":
      return `M0,0l${m},${m}h${w - m}v${h}h${-w}z`;
    case "top-right":
      return `M0,0l${-m},${m}h${m - w}v${h}h${w}z`;
    case "bottom-left":
      return `M0,0l${m},${-m}h${w - m}v${-h}h${-w}z`;
    case "bottom-right":
      return `M0,0l${-m},${-m}h${m - w}v${-h}h${w}z`;
  }
}

function stopPropagation(event) {
  event.stopPropagation();
}
