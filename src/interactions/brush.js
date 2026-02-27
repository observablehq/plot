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

export class Brush extends Mark {
  constructor({dimension = "xy", interval, sync = false} = {}) {
    super(undefined, {}, {}, {});
    this._dimension = keyword(dimension, "dimension", ["x", "y", "xy"]);
    this._brush = this._dimension === "x" ? d3BrushX() : this._dimension === "y" ? d3BrushY() : d3Brush();
    this._interval = interval == null ? null : maybeInterval(interval);
    this._brushNodes = [];
    this._sync = sync;
    this.inactive = renderFilter(true);
    this.context = renderFilter(false);
    this.focus = renderFilter(false);
  }
  render(index, scales, values, dimensions, context) {
    if (typeof document === "undefined") return null;
    const {x, y, fx, fy} = scales;
    const {inactive, context: ctx, focus} = this;
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
      const {_brush, _brushNodes} = this;
      const sync = this._sync;
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
                const filter = filterFromBrush(dim, interval, x, y, facet, context.projection, px, px, py, py);
                value = {
                  ...(dim !== "y" && {x1: invertX(px), x2: invertX(px)}),
                  ...(dim !== "x" && {y1: invertY(py), y2: invertY(py)}),
                  ...(fx && facet && {fx: facet.x}),
                  ...(fy && facet && {fy: facet.y}),
                  filter,
                  pending: true
                };
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
            const filter = filterFromBrush(dim, interval, x, y, facet, context.projection, px1, px2, py1, py2);
            context.dispatchValue({
              ...(dim !== "y" && {x1, x2}),
              ...(dim !== "x" && {y1, y2}),
              ...(fx && facet && {fx: facet.x}),
              ...(fy && facet && {fy: facet.y}),
              filter,
              ...(type !== "end" && {pending: true})
            });
          }
        });
    }

    const g = create("svg:g").attr("aria-label", this._dimension === "xy" ? "brush" : `brush-${this._dimension}`);
    g.call(this._brush);
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

export function brush(options) {
  return new Brush(options);
}

export function brushX({interval} = {}) {
  return new Brush({dimension: "x", interval});
}

export function brushY({interval} = {}) {
  return new Brush({dimension: "y", interval});
}

function filterFromBrush(dim, interval, xScale, yScale, facet, projection, px1, px2, py1, py2) {
  switch (dim) {
    case "x":
    case "y": {
      const floor = interval ? (d) => interval.floor(d) : (d) => d;
      const [scale, pv1, pv2] = dim === "x" ? [xScale, px1, px2] : [yScale, py1, py2];
      let p;
      return filterSignature1D((d) => ((p = scale(floor(d))), pv1 <= p && p < pv2), facet?.x, facet?.y);
    }
    case "xy": {
      let px, py;
      const stream = projection?.stream({
        point(x, y) {
          px = x;
          py = y;
        }
      }) ?? {
        point: (x, y) => {
          px = xScale(x);
          py = yScale(y);
        }
      };
      return filterSignature2D(
        (dx, dy) => (stream.point(dx, dy), px1 <= px && px < px2 && py1 <= py && py < py2),
        facet?.x,
        facet?.y
      );
    }
  }
}

function filterSignature2D(test, currentFx, currentFy) {
  return currentFx === undefined
    ? currentFy === undefined
      ? (x, y) => test(x, y)
      : (x, y, fy) => (fy === undefined || fy === currentFy) && test(x, y)
    : currentFy === undefined
    ? (x, y, fx) => (fx === undefined || fx === currentFx) && test(x, y)
    : (x, y, fx, fy) => (fx === undefined || fx === currentFx) && (fy === undefined || fy === currentFy) && test(x, y);
}

function filterSignature1D(test, currentFx, currentFy) {
  return currentFx === undefined
    ? currentFy === undefined
      ? (v) => test(v)
      : (v, fy) => (fy === undefined || fy === currentFy) && test(v)
    : currentFy === undefined
    ? (v, fx) => (fx === undefined || fx === currentFx) && test(v)
    : (v, fx, fy) => (fx === undefined || fx === currentFx) && (fy === undefined || fy === currentFy) && test(v);
}

function intervalRound(interval, v) {
  const lo = interval.floor(v);
  const hi = interval.offset(lo);
  v = +v;
  return v - +lo < +hi - v ? lo : hi;
}

function renderFilter(initialTest) {
  const updatePerFacet = [];
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
