import {create} from "../context.js";
import {brush as brusher, brushX as brusherX, brushY as brusherY} from "d3";
import {composeRender} from "../mark.js";
import {take} from "../options.js";

const states = new WeakMap();

function brushTransform(mode, options) {
  return {
    ...options,
    // Interactive transforms must be the outermost render function because they
    // will re-render dynamically in response to pointer events.
    render: composeRender(function (index, scales, values, dimensions, context, next) {
      const svg = context.ownerSVGElement;
      const {data} = context.getMarkState(this);

      // Isolate state per-brush, per-plot; if the brush is reused by multiple
      // marks, they will share the same state.
      let state = states.get(svg);
      if (!state) states.set(svg, (state = {brushes: [], bounds: new WeakMap(), selection: null}));
      const {brushes, bounds} = state;

      // Intersection bounds are computed once per mark (for all facets)
      if (!bounds.has(this)) {
        const {x, y} = scales;
        const bx = x?.bandwidth?.() ?? 0;
        const by = y?.bandwidth?.() ?? 0;
        const {x: X, x1: X1, x2: X2, y: Y, y1: Y1, y2: Y2} = values;
        const Xl = X1 && X2 ? X1.map((d, i) => Math.min(d, X2[i])) : X;
        const Xm = X1 && X2 ? X1.map((d, i) => Math.max(d, X2[i]) + bx) : bx ? X.map((d) => d + bx) : X;
        const Yl = Y1 && Y2 ? Y1.map((d, i) => Math.min(d, Y2[i])) : Y;
        const Ym = Y1 && Y2 ? Y1.map((d, i) => Math.max(d, Y2[i]) + by) : by ? Y.map((d) => d + by) : Y;
        bounds.set(this, {Xl, Xm, Yl, Ym});
      }
      const {Xl, Xm, Yl, Ym} = bounds.get(this);

      let viz = next.call(this, [], scales, values, dimensions, context);
      const {width, height, marginLeft, marginTop, marginRight, marginBottom} = dimensions;

      const g = create("svg:g", context);
      g.append(() => viz);

      const brush = (mode === "xy" ? brusher : mode === "x" ? brusherX : brusherY)()
        .extent([
          [marginLeft, marginTop],
          [width - marginRight, height - marginBottom]
        ])
        .on("brush start end", (event) => {
          const {type, selection} = event;
          let S = null;
          if (selection) {
            S = index;
            if (mode === "x" || mode === "xy") {
              const [x0, x1] = mode === "xy" ? [selection[0][0], selection[1][0]] : selection;
              S = S.filter((i) => x0 <= Xm[i] && Xl[i] <= x1);
            }
            if (mode === "y" || mode === "xy") {
              const [y0, y1] = mode === "xy" ? [selection[0][1], selection[1][1]] : selection;
              S = S.filter((i) => y0 <= Ym[i] && Yl[i] <= y1);
            }
          }
          viz.replaceWith((viz = next.call(this, S ?? [], scales, values, dimensions, context)));

          for (const b of brushes) {
            if (b.brush === brush) {
              b.index = S;
            } else if (type === "start") {
              b.target.call(b.brush.move, null);
            }
          }

          if (!selectionEquals(S, state.selection)) {
            state.selection = S;
            context.dispatchValue(S === null ? data : take(data, S));
          }
        });

      brushes.push({brush, target: g.append("g").call(brush)});

      return g.node();
    }, options.render)
  };
}

export function brush(options = {}) {
  return brushTransform("xy", options);
}

export function brushX(options = {}) {
  return brushTransform("x", options);
}

export function brushY(options = {}) {
  return brushTransform("y", options);
}

function selectionEquals(A, B) {
  if (A === B) return true;
  if (!Array.isArray(A) || !Array.isArray(B) || A.length != B.length) return false;
  for (let i = 0; i < A.length; ++i) if (A[i] !== B[i]) return false;
  return true;
}
