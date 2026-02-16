import {
  brush as d3Brush,
  brushX as d3BrushX,
  brushY as d3BrushY,
  create,
  pointer,
  select,
  selectAll,
  ascending
} from "d3";
import {composeRender, Mark} from "../mark.js";
import {constant, dataify, identity, isIterable, keyword, maybeInterval, maybeTuple, take} from "../options.js";
import {pixelRound} from "../precision.js";
import {applyAttr} from "../style.js";

const defaults = {ariaLabel: "brush", fill: "#777", fillOpacity: 0.3, stroke: "#fff"};

export class Region {
  constructor({x1, x2, y1, y2, fx, fy, data, pending} = {}) {
    if (x1 !== undefined) this.x1 = x1;
    if (x2 !== undefined) this.x2 = x2;
    if (y1 !== undefined) this.y1 = y1;
    if (y2 !== undefined) this.y2 = y2;
    if (fx !== undefined) this.fx = fx;
    if (fy !== undefined) this.fy = fy;
    if (data !== undefined) this.data = data;
    if (pending !== undefined) this.pending = pending;
  }
  contains(x, y, facets) {
    if (this.x1 === undefined || this.y1 === undefined) {
      // 1D: second arg is facets
      facets = y;
      if (this.x1 === undefined) {
        y = x;
        x = undefined;
      } else {
        y = undefined;
      }
    }
    if (x !== undefined && !(this.x1 <= x && x <= this.x2)) return false;
    if (y !== undefined && !(this.y1 <= y && y <= this.y2)) return false;
    if (facets) {
      if ("fx" in facets && "fx" in this && facets.fx !== this.fx) return false;
      if ("fy" in facets && "fy" in this && facets.fy !== this.fy) return false;
    }
    return true;
  }
}

export class Brush extends Mark {
  constructor(data, {dimension = "xy", interval, sync = false, ...options} = {}) {
    const {x, y, z} = options;
    super(
      dataify(data),
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true}
      },
      options,
      defaults
    );
    this._dimension = keyword(dimension, "dimension", ["x", "y", "xy"]);
    this._brush = this._dimension === "x" ? d3BrushX() : this._dimension === "y" ? d3BrushY() : d3Brush();
    this._interval = interval == null ? null : maybeInterval(interval);
    const channelDefaults = {x, y, z, fx: this.fx, fy: this.fy};
    this.inactive = renderFilter(true, channelDefaults);
    this.context = renderFilter(false, channelDefaults);
    this.focus = renderFilter(false, channelDefaults);
    this._brushNodes = [];
    this._sync = sync;
  }
  render(index, scales, values, dimensions, context) {
    if (typeof document === "undefined") return null;
    const {x, y, fx, fy} = scales;
    const X = values.channels?.x?.value;
    const Y = values.channels?.y?.value;
    const FX = values.channels?.fx?.value;
    const FY = values.channels?.fy?.value;
    const {data, _brush, _brushNodes, inactive, context: ctx, focus} = this;
    let target, currentNode, syncing;

    if (!index?.fi) {
      const dim = this._dimension;
      const interval = this._interval;
      if (context.projection && dim !== "xy") throw new Error(`brush${dim.toUpperCase()} does not support projections`);
      const invertX = precisionInvert(x, context.projection);
      const invertY = precisionInvert(y, context.projection);
      const applyX = (this._applyX = (!context.projection && x) || ((d) => d));
      const applyY = (this._applyY = (!context.projection && y) || ((d) => d));
      context.dispatchValue(null);
      const sync = this._sync;
      const filterData =
        data != null &&
        ((region) =>
          take(
            data,
            index.filter((_, i) =>
              region.contains(
                dim !== "y" ? X[i] : undefined,
                dim !== "x" ? Y[i] : undefined,
                FX || FY ? {fx: FX?.[i], fy: FY?.[i]} : undefined
              )
            )
          ));
      let snapping;
      _brush
        .extent([
          [dimensions.marginLeft - (dim !== "y"), dimensions.marginTop - (dim !== "x")],
          [
            dimensions.width - dimensions.marginRight + (dim !== "y"),
            dimensions.height - dimensions.marginBottom + (dim !== "x")
          ]
        ])
        .on("start brush end", function (event) {
          if (syncing) return;
          const {selection, type} = event;
          if (type === "start" && !snapping) {
            target = event.sourceEvent?.currentTarget ?? this;
            currentNode = _brushNodes.indexOf(target);
            if (!sync) {
              syncing = true;
              selectAll(_brushNodes.filter((_, i) => i !== currentNode)).call(_brush.move, null);
              syncing = false;
            }
            for (let i = 0; i < _brushNodes.length; ++i) {
              inactive.update(false, i);
              ctx.update(true, i);
              focus.update(false, i);
            }
          }

          if (selection === null) {
            if (type === "end") {
              if (sync) {
                syncing = true;
                selectAll(_brushNodes.filter((_, i) => i !== currentNode)).call(_brush.move, null);
                syncing = false;
              }
              for (let i = 0; i < _brushNodes.length; ++i) {
                inactive.update(true, i);
                ctx.update(false, i);
                focus.update(false, i);
              }
              context.dispatchValue(null);
            } else {
              for (let i = sync ? 0 : currentNode, n = sync ? _brushNodes.length : currentNode + 1; i < n; ++i) {
                inactive.update(false, i);
                ctx.update(true, i);
                focus.update(false, i);
              }
              let value = null;
              if (event.sourceEvent) {
                const [px, py] = pointer(event, this);
                const facet = target?.__data__;
                value = new Region({
                  ...(dim !== "y" && {x1: invertX(px), x2: invertX(px)}),
                  ...(dim !== "x" && {y1: invertY(py), y2: invertY(py)}),
                  ...(fx && facet && {fx: facet.x}),
                  ...(fy && facet && {fy: facet.y}),
                  pending: true
                });
                if (filterData) value.data = filterData(value);
              }
              context.dispatchValue(value);
            }
          } else {
            const [[px1, py1], [px2, py2]] = dim === "xy" ? selection
                : dim === "x" ? [[selection[0]], [selection[1]]]
                : [[, selection[0]], [, selection[1]]]; // prettier-ignore
            const inX = dim !== "y" && ((xi) => px1 <= xi && xi < px2);
            const inY = dim !== "x" && ((yi) => py1 <= yi && yi < py2);
            if (sync) {
              syncing = true;
              selectAll(_brushNodes.filter((_, i) => i !== currentNode)).call(_brush.move, selection);
              syncing = false;
            }
            for (let i = sync ? 0 : currentNode, n = sync ? _brushNodes.length : currentNode + 1; i < n; ++i) {
              inactive.update(false, i);
              ctx.update(!inX ? (_, yi) => !inY(yi) : !inY ? (xi) => !inX(xi) : (xi, yi) => !(inX(xi) && inY(yi)), i);
              focus.update(!inX ? (_, yi) => inY(yi) : !inY ? inX : (xi, yi) => inX(xi) && inY(yi), i);
            }

            const [x1, x2] = invertX && [invertX(px1), invertX(px2)].sort(ascending);
            const [y1, y2] = invertY && [invertY(py1), invertY(py2)].sort(ascending);

            // Snap to interval on end
            if (!snapping && type === "end" && interval) {
              const [s1, s2] = dim === "x" ? [x1, x2] : [y1, y2];
              const r1 = intervalRound(interval, s1);
              let r2 = intervalRound(interval, s2);
              if (+r1 === +r2) r2 = interval.offset(r1);
              snapping = true;
              select(this).call(_brush.move, [r1, r2].map(dim === "x" ? applyX : applyY).sort(ascending));
              snapping = false;
              return;
            }

            const facet = target?.__data__;
            const region = new Region({
              ...(dim !== "y" && {x1, x2}),
              ...(dim !== "x" && {y1, y2}),
              ...(fx && facet && {fx: facet.x}),
              ...(fy && facet && {fy: facet.y}),
              ...(type !== "end" && {pending: true})
            });
            if (filterData) region.data = filterData(region);
            context.dispatchValue(region);
          }
        });
    }

    const g = create("svg:g").attr("aria-label", this._dimension === "xy" ? "brush" : `brush-${this._dimension}`);
    g.call(this._brush);
    const sel = g.select(".selection");
    applyAttr(sel, "fill", this.fill);
    applyAttr(sel, "fill-opacity", this.fillOpacity);
    applyAttr(sel, "stroke", this.stroke);
    applyAttr(sel, "stroke-width", this.strokeWidth);
    applyAttr(sel, "stroke-opacity", this.strokeOpacity);
    const node = g.node();
    this._brushNodes.push(node);
    return node;
  }
  move(value) {
    if (value == null) {
      selectAll(this._brushNodes).call(this._brush.move, null);
      return;
    }
    const {x1, x2, y1, y2, fx, fy} = value;
    const node = this._brushNodes.find(
      (n) => (fx === undefined || n.__data__?.x === fx) && (fy === undefined || n.__data__?.y === fy)
    );
    if (!node) return;
    const [px1, px2] = [x1, x2].map(this._applyX).sort(ascending);
    const [py1, py2] = [y1, y2].map(this._applyY).sort(ascending);
    select(node).call(
      this._brush.move,
      this._dimension === "xy"
        ? [
            [px1, py1],
            [px2, py2]
          ]
        : this._dimension === "x"
        ? [px1, px2]
        : [py1, py2]
    );
  }
}

export function brush(data, options = {}) {
  if (arguments.length === 1 && !isIterable(data)) (options = data), (data = undefined);
  let {x, y, ...rest} = options;
  [x, y] = maybeTuple(x, y);
  return new Brush(data, {...rest, x, y});
}

export function brushX(data, options = {}) {
  if (arguments.length === 1 && !isIterable(data)) (options = data), (data = undefined);
  let {x, interval, ...rest} = options;
  if (x === undefined && data != null) x = identity;
  return new Brush(data, {...rest, dimension: "x", interval, x});
}

export function brushY(data, options = {}) {
  if (arguments.length === 1 && !isIterable(data)) (options = data), (data = undefined);
  let {y, interval, ...rest} = options;
  if (y === undefined && data != null) y = identity;
  return new Brush(data, {...rest, dimension: "y", interval, y});
}

function intervalRound(interval, v) {
  const lo = interval.floor(v);
  const hi = interval.offset(lo);
  v = +v;
  return v - +lo < +hi - v ? lo : hi;
}

function renderFilter(initialTest, channelDefaults = {}) {
  const updatePerFacet = [];
  return Object.assign(
    function ({render, ...options} = {}) {
      return {
        pointerEvents: "none",
        ...channelDefaults,
        ...options,
        render: composeRender((index, scales, values, dimensions, context, next) => {
          const {x: X, y: Y, x1: X1, x2: X2, y1: Y1, y2: Y2, z: Z} = values;
          const MX = X ?? (X1 && X2 ? Float64Array.from(X1, (v, i) => (v + X2[i]) / 2) : undefined);
          const MY = Y ?? (Y1 && Y2 ? Float64Array.from(Y1, (v, i) => (v + Y2[i]) / 2) : undefined);
          const G = Array((MX ?? MY).length);
          const render = (test) => {
            if (typeof test !== "function") test = constant(test);
            const I = [];
            let run = 0;
            for (const i of index) {
              if (test(MX?.[i], MY?.[i])) {
                I.push(i);
                G[i] = `${Z?.[i] ?? ""}/${run}`;
              } else ++run;
            }
            return next(I, scales, {...values, z: G}, dimensions, context);
          };
          let g = render(initialTest);
          updatePerFacet.push((test) => {
            const transform = g.getAttribute("transform");
            g.replaceWith((g = render(test)));
            if (transform) g.setAttribute("transform", transform);
          });
          return g;
        }, render)
      };
    },
    {
      update(test, i) {
        return updatePerFacet[i]?.(test);
      }
    }
  );
}

function precisionInvert(scale, projection) {
  if (projection || !scale?.invert) return (d) => d;
  const round = pixelRound(scale);
  return (p) => round(scale.invert(p));
}
