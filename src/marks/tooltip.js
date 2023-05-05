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
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true}
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
  render(index, scales, {x: X, y: Y, channels}, dimensions, context) {
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
    const foreground = "black";
    const background = "white";
    const kx = axis === "y" ? 1 / 100 : 1;
    const ky = axis === "x" ? 1 / 100 : 1;
    let i, xi, yi; // currently-focused index and position
    let c = corner; // last-used corner (for stability)
    let sticky = false;
    // TODO Cleanup listeners on SVG removal?
    const window = svg.ownerDocument.defaultView;
    window.addEventListener("pointermove", (event) => {
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
            const xj = (X ? X[j] : cx) + oxj;
            const yj = (Y ? Y[j] : cy) + oyj;
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
          let channel = channels[key];
          while (channel.source) channel = channel.source;
          if (channel.source === null) continue; // e.g., dodgeY’s y
          const label = scales[channel.scale]?.label ?? key;
          text.push([label, formatDefault(channel.value[i])]);
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
          const cy = (/^top-/.test(c) ? yi + h + m + r * 2 > height : yi - h - m - r * 2 > 0) ? "bottom" : "top";
          c = `${cy}-${cx}`;
        }
        const oy = getLineOffset(c, text) * lineHeight;
        tspan.attr("y", (d, i) => `${i * lineHeight + oy}em`);
        path.attr("d", getPath(c, m, r, w, h));
        content.attr("transform", getTextTransform(c, m, r, w, h));
      }
    });
    window.addEventListener("pointerdown", () => {
      if (sticky) {
        sticky = false;
        dot.attr("display", "none");
        dot.attr("pointer-events", "none");
      } else if (i !== undefined) {
        sticky = true;
        dot.attr("pointer-events", "all");
      }
    });
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
      .on("pointerdown pointermove", (event) => event.stopPropagation());
    const content = dot
      .append("text")
      .attr("fill", foreground)
      .call(applyIndirectTextStyles, this)
      .on("pointerdown pointermove", (event) => event.stopPropagation());
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
