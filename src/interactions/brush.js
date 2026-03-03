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
import {constant, keyword, maybeInterval} from "../options.js";
import {pixelRound} from "../precision.js";

export class Region {
  constructor({x1, x2, y1, y2, fx, fy, pending} = {}) {
    if (x1 !== undefined) this.x1 = x1;
    if (x2 !== undefined) this.x2 = x2;
    if (y1 !== undefined) this.y1 = y1;
    if (y2 !== undefined) this.y2 = y2;
    if (fx !== undefined) this.fx = fx;
    if (fy !== undefined) this.fy = fy;
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
  constructor({dimension = "xy", interval, sync = false} = {}) {
    super(undefined, {}, {}, {});
    this._dimension = keyword(dimension, "dimension", ["x", "y", "xy"]);
    this._interval = interval == null ? null : maybeInterval(interval);
    this._sync = sync;
    this._states = []; // per-plot state: {brush, nodes, applyX, applyY}
    this._syncing = false;
    this.inactive = renderFilter(true);
    this.context = renderFilter(false);
    this.focus = renderFilter(false);
  }
  render(index, scales, values, dimensions, context) {
    if (typeof document === "undefined") return null;
    const {x, y, fx, fy} = scales;
    const {inactive, context: ctx, focus, _states} = this;

    // Per-plot state; context.interaction is fresh for each plot.
    let state = context.interaction.brush;
    if (state) {
      if (state.mark !== this) throw new Error("only one brush per plot");
    } else {
      const dim = this._dimension;
      const interval = this._interval;
      if (context.projection && dim !== "xy") throw new Error(`brush${dim.toUpperCase()} does not support projections`);
      const invertX = precisionInvert(x, context.projection);
      const invertY = precisionInvert(y, context.projection);
      const applyX = (!context.projection && x) || ((d) => d);
      const applyY = (!context.projection && y) || ((d) => d);
      const brush = dim === "x" ? d3BrushX() : dim === "y" ? d3BrushY() : d3Brush();
      const nodes = [];
      context.interaction.brush = state = {mark: this, brush, nodes, applyX, applyY, svg: context.ownerSVGElement};
      _states.push(state);
      context.dispatchValue(null);
      const sync = this._sync;
      const self = this;
      let target, currentNode, snapping;

      brush
        .extent([
          [dimensions.marginLeft - (dim !== "y"), dimensions.marginTop - (dim !== "x")],
          [
            dimensions.width - dimensions.marginRight + (dim !== "y"),
            dimensions.height - dimensions.marginBottom + (dim !== "x")
          ]
        ])
        .on("start brush end", function (event) {
          if (self._syncing) return;
          const {selection, type} = event;
          if (type === "start" && !snapping) {
            target = event.sourceEvent?.currentTarget ?? this;
            currentNode = nodes.indexOf(target);
            // Clear other facets within this plot
            if (!sync) {
              self._syncing = true;
              selectAll(nodes.filter((_, i) => i !== currentNode)).call(brush.move, null);
              self._syncing = false;
            }
            for (const p of _states) {
              inactive.update(false, p);
              ctx.update(true, p);
              focus.update(false, p);
            }
          }

          if (selection === null) {
            if (type === "end") {
              if (sync) {
                self._syncing = true;
                selectAll(nodes.filter((_, i) => i !== currentNode)).call(brush.move, null);
                self._syncing = false;
              }
              // Clear all other plots
              self._syncing = true;
              for (const p of _states) {
                if (p === state) continue;
                selectAll(p.nodes).call(p.brush.move, null);
              }
              self._syncing = false;
              for (const p of _states) {
                inactive.update(true, p);
                ctx.update(false, p);
                focus.update(false, p);
              }
              context.dispatchValue(null);
            } else {
              if (sync) {
                for (const p of _states) {
                  inactive.update(false, p);
                  ctx.update(true, p);
                  focus.update(false, p);
                }
              } else {
                inactive.update(false, state, currentNode);
                ctx.update(true, state, currentNode);
                focus.update(false, state, currentNode);
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
              self._syncing = true;
              selectAll(nodes.filter((_, i) => i !== currentNode)).call(brush.move, selection);
              self._syncing = false;
            }
            const ctxTest = !inX ? (_, yi) => !inY(yi) : !inY ? (xi) => !inX(xi) : (xi, yi) => !(inX(xi) && inY(yi));
            const focusTest = !inX ? (_, yi) => inY(yi) : !inY ? inX : (xi, yi) => inX(xi) && inY(yi);
            if (sync) {
              inactive.update(false, state);
              ctx.update(ctxTest, state);
              focus.update(focusTest, state);
            } else {
              inactive.update(false, state, currentNode);
              ctx.update(ctxTest, state, currentNode);
              focus.update(focusTest, state, currentNode);
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
              select(this).call(brush.move, [r1, r2].map(dim === "x" ? applyX : applyY).sort(ascending));
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
            context.dispatchValue(region);

            // Sync other plots in data space
            if (type !== "start") {
              self._syncing = true;
              for (const p of _states) {
                if (p === state) continue;
                const [pX1, pX2] = [p.applyX(x1), p.applyX(x2)].sort(ascending);
                const [pY1, pY2] = [p.applyY(y1), p.applyY(y2)].sort(ascending);
                const selection =
                  dim === "xy"
                    ? [
                        [pX1, pY1],
                        [pX2, pY2]
                      ]
                    : dim === "x"
                    ? [pX1, pX2]
                    : [pY1, pY2];
                selectAll(p.nodes).call(p.brush.move, selection);
                const inXp = dim !== "y" && ((xi) => p.applyX(x1) <= xi && xi < p.applyX(x2));
                const inYp = dim !== "x" && ((yi) => p.applyY(y1) <= yi && yi < p.applyY(y2));
                inactive.update(false, p);
                ctx.update(
                  !inXp ? (_, yi) => !inYp(yi) : !inYp ? (xi) => !inXp(xi) : (xi, yi) => !(inXp(xi) && inYp(yi)),
                  p
                );
                focus.update(!inXp ? (_, yi) => inYp(yi) : !inYp ? inXp : (xi, yi) => inXp(xi) && inYp(yi), p);
              }
              self._syncing = false;
            }
          }
        });
    }

    const g = create("svg:g").attr("aria-label", this._dimension === "xy" ? "brush" : `brush-${this._dimension}`);
    g.call(state.brush);
    const node = g.node();
    state.nodes.push(node);
    return node;
  }
  move(value) {
    if (value == null) {
      for (const {brush, nodes} of this._states) {
        selectAll(nodes).call(brush.move, null);
      }
      return;
    }
    const dim = this._dimension;
    const {x1, x2, y1, y2, fx, fy} = value;
    for (const {brush, nodes, applyX, applyY} of this._states) {
      const node = nodes.find(
        (n) => (fx === undefined || n.__data__?.x === fx) && (fy === undefined || n.__data__?.y === fy)
      );
      if (!node) continue;
      const [px1, px2] = dim !== "y" ? [x1, x2].map(applyX).sort(ascending) : [];
      const [py1, py2] = dim !== "x" ? [y1, y2].map(applyY).sort(ascending) : [];
      const selection =
        dim === "xy"
          ? [
              [px1, py1],
              [px2, py2]
            ]
          : dim === "x"
          ? [px1, px2]
          : [py1, py2];
      select(node).call(brush.move, selection);
    }
  }
}

export function brush(options) {
  return new Brush(options);
}

export function brushX({interval} = {}) {
  return new Brush({dimension: "x", interval});
}

export function brushY({interval} = {}) {
  return new Brush({dimension: "y", interval});
}

function intervalRound(interval, v) {
  const lo = interval.floor(v);
  const hi = interval.offset(lo);
  v = +v;
  return v - +lo < +hi - v ? lo : hi;
}

function renderFilter(initialTest) {
  const updates = new WeakMap();
  return Object.assign(
    function ({render, ...options} = {}) {
      return {
        pointerEvents: "none",
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
          const svg = context.ownerSVGElement;
          if (!updates.has(svg)) updates.set(svg, []);
          updates.get(svg).push((test) => {
            const transform = g.getAttribute("transform");
            g.replaceWith((g = render(test)));
            if (transform) g.setAttribute("transform", transform);
          });
          return g;
        }, render)
      };
    },
    {
      update(test, state, facet) {
        if (facet === undefined) {
          const fns = updates.get(state.svg);
          if (fns) for (const fn of fns) fn(test);
        } else {
          updates.get(state.svg)?.[facet]?.(test);
        }
      }
    }
  );
}

function precisionInvert(scale, projection) {
  if (projection || !scale?.invert) return (d) => d;
  const round = pixelRound(scale);
  return (p) => round(scale.invert(p));
}
