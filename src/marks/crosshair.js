import {create, pointer as d3pointer, select} from "d3";
import {getSource} from "../channel.js";
import {formatIsoDate} from "../format.js";
import {pointer, pointerX, pointerY} from "../interactions/pointer.js";
import {Mark, marks} from "../mark.js";
import {isIterable, keyword} from "../options.js";
import {initializer} from "../transforms/basic.js";
import {ruleX, ruleY} from "./rule.js";
import {text} from "./text.js";

// Returns a function (px) → {value, px} that inverts a pixel position to a
// domain value and a snapped pixel position. For continuous scales, the value
// is precision-rounded; for band/point scales, the value is the nearest domain
// element and the pixel snaps to the band center.
function scaleInvert(scale) {
  if (scale.bandwidth) {
    const domain = scale.domain();
    const step = scale.step();
    const offset = scale.bandwidth() / 2;
    const start = scale(domain[0]) + 0.5;
    return (px) => {
      const i = Math.max(0, Math.min(domain.length - 1, Math.round((px - start - offset) / step)));
      const value = domain[i];
      return {value, px: scale(value) + offset};
    };
  }
  if (!scale.invert) return null;
  return (px) => {
    const value = scale.invert(px);
    return {value, px};
  };
}

export function crosshair(data, options) {
  if (arguments.length < 2 && !isIterable(data)) return new Crosshair(data);
  return crosshairK(pointer, data, options);
}

export function crosshairX(data, options) {
  if (arguments.length < 2 && !isIterable(data)) return new Crosshair({...data, dimension: "x"});
  return crosshairK(pointerX, data, options);
}

export function crosshairY(data, options) {
  if (arguments.length < 2 && !isIterable(data)) return new Crosshair({...data, dimension: "y"});
  return crosshairK(pointerY, data, options);
}

function crosshairK(pointer, data, options = {}) {
  const {x, y, maxRadius} = options;
  const p = pointer({px: x, py: y, maxRadius});
  const M = [];
  if (x != null) M.push(ruleX(data, ruleOptions("x", {...p, inset: -6}, options)));
  if (y != null) M.push(ruleY(data, ruleOptions("y", {...p, inset: -6}, options)));
  if (x != null) M.push(text(data, textOptions("x", {...p, dy: 9, frameAnchor: "bottom", lineAnchor: "top"}, options)));
  if (y != null) M.push(text(data, textOptions("y", {...p, dx: -9, frameAnchor: "left", textAnchor: "end"}, options)));
  for (const m of M) m.ariaLabel = `crosshair ${m.ariaLabel}`;
  return marks(...M); // TODO: add .move() (shared with Crosshair class)
}

function markOptions(
  k,
  {channels: pointerChannels, ...pointerOptions},
  {facet, facetAnchor, fx, fy, [k]: p, channels, transform, initializer}
) {
  return {
    ...pointerOptions,
    facet,
    facetAnchor,
    fx,
    fy,
    [k]: p,
    channels: {...pointerChannels, ...channels},
    transform,
    initializer: pxpy(k, initializer)
  };
}

// Wrap the initializer, if any, mapping px and py to x and y temporarily (e.g.,
// for hexbin) then mapping back to px and py for rendering.
function pxpy(k, i) {
  if (i == null) return i;
  return function (data, facets, {x: x1, y: y1, px, py, ...c1}, ...args) {
    const {channels: {x, y, ...c} = {}, ...rest} = i.call(this, data, facets, {...c1, x: px, y: py}, ...args);
    return {
      channels: {
        ...c,
        ...(x && {px: x, ...(k === "x" && {x})}),
        ...(y && {py: y, ...(k === "y" && {y})})
      },
      ...rest
    };
  };
}

function ruleOptions(k, pointerOptions, options) {
  const {
    color = "currentColor",
    opacity = 0.2,
    ruleStroke: stroke = color,
    ruleStrokeOpacity: strokeOpacity = opacity,
    ruleStrokeWidth: strokeWidth
  } = options;
  return {
    ...markOptions(k, pointerOptions, options),
    stroke,
    strokeOpacity,
    strokeWidth
  };
}

function textOptions(k, pointerOptions, options) {
  const {
    color = "currentColor",
    textFill: fill = color,
    textFillOpacity: fillOpacity,
    textStroke: stroke = "var(--plot-background)",
    textStrokeOpacity: strokeOpacity,
    textStrokeWidth: strokeWidth = 5
  } = options;
  return {
    ...markOptions(k, pointerOptions, textChannel(k, options)),
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    strokeWidth
  };
}

// Rather than aliasing text to have the same definition as x and y, we use an
// initializer to alias the channel values, such that the text channel can be
// derived by an initializer such as hexbin.
function textChannel(source, options) {
  return initializer(options, (data, facets, channels) => {
    return {channels: {text: {value: getSource(channels, source)?.value}}};
  });
}

export class Crosshair extends Mark {
  constructor({dimension = "xy", color = "currentColor", opacity = 0.2, ...options} = {}) {
    super(undefined, {}, options, {});
    this._dimension = keyword(dimension, "dimension", ["x", "y", "xy"]);
    this._color = color;
    this._opacity = opacity;
    this._states = [];
  }
  render(index, scales, values, dimensions, context) {
    const {x, y, fx, fy} = scales;
    const dim = this._dimension;
    const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;
    const right = width - marginRight;
    const bottom = height - marginBottom;
    const labelOffset = 9; // default axis tickSize + tickPadding

    // Setup once (first facet); for dataless marks index is always null,
    // so we check _states.length instead of index.fi.
    if (!this._states.length) {
      this._invertX = dim !== "y" && x && !context.projection ? scaleInvert(x) : null;
      this._invertY = dim !== "x" && y && !context.projection ? scaleInvert(y) : null;
      this._formatX = this._invertX && (x.type === "utc" || x.type === "time" ? formatIsoDate : String);
      this._formatY = this._invertY && (y.type === "utc" || y.type === "time" ? formatIsoDate : String);
      if (this._invertX) this._scaleX = x;
      if (this._invertY) this._scaleY = y;
      this._dispatch = context.dispatchValue;
      this._fx = fx;
      this._fy = fy;
      context.dispatchValue(null);
    }

    const {_invertX: invertX, _invertY: invertY, _formatX: formatX, _formatY: formatY} = this;

    const g = create("svg:g").attr("aria-label", "crosshair").attr("pointer-events", "none");

    // Transparent rect for pointer capture
    g.append("rect")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", right - marginLeft)
      .attr("height", bottom - marginTop);

    // Vertical rule (for x)
    const ruleXEl = invertX
      ? g
          .append("line")
          .attr("stroke", this._color)
          .attr("stroke-opacity", this._opacity)
          .attr("y1", marginTop)
          .attr("y2", bottom)
          .attr("display", "none")
      : null;

    // Horizontal rule (for y)
    const ruleYEl = invertY
      ? g
          .append("line")
          .attr("stroke", this._color)
          .attr("stroke-opacity", this._opacity)
          .attr("x1", marginLeft)
          .attr("x2", right)
          .attr("display", "none")
      : null;

    // Text label for x (at bottom)
    const textXEl = invertX
      ? g
          .append("text")
          .attr("fill", this._color)
          .attr("stroke", "var(--plot-background)")
          .attr("stroke-width", 5)
          .attr("stroke-linejoin", "round")
          .attr("paint-order", "stroke")
          .attr("text-anchor", "middle")
          .attr("font-variant", "tabular-nums")
          .attr("dy", "0.71em")
          .attr("y", bottom + labelOffset + 0.5)
          .attr("display", "none")
      : null;

    // Text label for y (at left)
    const textYEl = invertY
      ? g
          .append("text")
          .attr("fill", this._color)
          .attr("stroke", "var(--plot-background)")
          .attr("stroke-width", 5)
          .attr("stroke-linejoin", "round")
          .attr("paint-order", "stroke")
          .attr("text-anchor", "end")
          .attr("font-variant", "tabular-nums")
          .attr("dy", "0.32em")
          .attr("x", marginLeft - labelOffset + 0.5)
          .attr("display", "none")
      : null;

    const node = g.node();
    const self = this;
    const stateIndex = this._states.length;

    const show = (px, py) => {
      if (ruleXEl) {
        const ix = invertX(px);
        ruleXEl.attr("x1", ix.px).attr("x2", ix.px).attr("display", null);
        textXEl.attr("x", ix.px).attr("display", null).text(formatX(ix.value));
      }
      if (ruleYEl) {
        const iy = invertY(py);
        ruleYEl.attr("y1", iy.px).attr("y2", iy.px).attr("display", null);
        textYEl.attr("y", iy.px).attr("display", null).text(formatY(iy.value));
      }
    };

    const hide = () => {
      ruleXEl?.attr("display", "none");
      ruleYEl?.attr("display", "none");
      textXEl?.attr("display", "none");
      textYEl?.attr("display", "none");
    };

    this._states.push({node, show, hide});

    select(node)
      .select("rect")
      .on("pointermove", function (event) {
        const [px, py] = d3pointer(event, node);
        for (let i = 0; i < self._states.length; i++) {
          if (i !== stateIndex) self._states[i].hide();
        }
        show(px, py);
        const facet = node.__data__;
        self._dispatch?.({
          ...(invertX && {x: invertX(px).value}),
          ...(invertY && {y: invertY(py).value}),
          ...(fx && facet && {fx: facet.x}),
          ...(fy && facet && {fy: facet.y})
        });
      })
      .on("pointerleave", function () {
        hide();
        self._dispatch?.(null);
      });

    return node;
  }
  move(value) {
    if (value == null) {
      for (const state of this._states) state.hide();
      this._dispatch?.(null);
      return;
    }
    const {x: vx, y: vy, fx, fy} = value;
    const sx = this._scaleX;
    const sy = this._scaleY;
    const px = vx != null && sx ? sx(vx) + (sx.bandwidth ? sx.bandwidth() / 2 : 0) : undefined;
    const py = vy != null && sy ? sy(vy) + (sy.bandwidth ? sy.bandwidth() / 2 : 0) : undefined;
    const state = this._states.find(
      (s) => (fx === undefined || s.node.__data__?.x === fx) && (fy === undefined || s.node.__data__?.y === fy)
    );
    if (!state) return;
    for (const s of this._states) {
      if (s !== state) s.hide();
    }
    state.show(px, py);
    this._dispatch?.({
      ...(this._invertX && vx != null && {x: vx}),
      ...(this._invertY && vy != null && {y: vy}),
      ...(this._fx && fx !== undefined && {fx}),
      ...(this._fy && fy !== undefined && {fy})
    });
  }
}
