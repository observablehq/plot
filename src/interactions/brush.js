import {create} from "../context.js";
import {ascending, select, transpose} from "d3";
import {brush as brusher, brushX as brusherX, brushY as brusherY} from "d3";
import {composeRender} from "../mark.js";
import {keyword, take} from "../options.js";

const states = new WeakMap();

function brushTransform(mode, {selectionMode = "data", ...options}) {
  selectionMode = keyword(selectionMode, "selectionMode", ["data", "extent"]);
  return {
    ...options,
    // Interactive transforms must be the outermost render function because they
    // will re-render dynamically in response to pointer events.
    render: composeRender(function (index, scales, values, dimensions, context, next) {
      const svg = context.ownerSVGElement;
      const {data} = context.getMarkState(this);

      // Isolate state per-plot.
      let state = states.get(svg);
      if (state && !index.fi) throw new Error("The brush interaction currently supports only one brush per plot.");
      if (!state) {
        // Derive intersection bounds.
        const {x, y} = scales;
        const bx = x?.bandwidth?.() ?? 0;
        const by = y?.bandwidth?.() ?? 0;
        const {x: X, x1: X1, x2: X2, y: Y, y1: Y1, y2: Y2} = values;
        const Xl = X1 && X2 ? X1.map((d, i) => Math.min(d, X2[i])) : X;
        const Xm = X1 && X2 ? X1.map((d, i) => Math.max(d, X2[i]) + bx) : bx ? X.map((d) => d + bx) : X;
        const Yl = Y1 && Y2 ? Y1.map((d, i) => Math.min(d, Y2[i])) : Y;
        const Ym = Y1 && Y2 ? Y1.map((d, i) => Math.max(d, Y2[i]) + by) : by ? Y.map((d) => d + by) : Y;

        // This brush is shared by all the facets.
        const {width, height, marginLeft, marginTop, marginRight, marginBottom} = dimensions;
        const extent = [
          [marginLeft, marginTop],
          [width - marginRight, height - marginBottom]
        ];
        const brush = (mode === "xy" ? brusher : mode === "x" ? brusherX : brusherY)()
          .extent(extent)
          .on("brush start end", function (event) {
            const f = select(this).datum();
            const {type, selection} = event;
            let S = null;
            const [X, Y] = selection
              ? mode === "xy"
                ? transpose(selection)
                : mode === "x"
                ? [selection]
                : [, selection]
              : [];
            if (X || Y) S = f.index;
            if (X) {
              const [x0, x1] = X;
              S = S.filter((i) => x0 <= Xm[i] && Xl[i] <= x1);
            }
            if (Y) {
              const [y0, y1] = Y;
              S = S.filter((i) => y0 <= Ym[i] && Yl[i] <= y1);
            }
            // Only one facet can be active at a time; clear the others.
            if (type === "start") for (let i = 0; i < cancels.length; ++i) if (i !== (f.index.fi ?? 0)) cancels[i]();

            f.display.replaceWith((f.display = next.call(this, S ?? [], scales, values, dimensions, context)));

            // Update the plot’s value if the selection has changed.
            if (selectionMode === "data") {
              if (!selectionEquals(S, state.selection)) {
                state.selection = S;
                context.dispatchValue(S === null ? data : take(data, S));
              }
            }
            // "extent"
            else {
              if (selection === null) {
                context.dispatchValue(null);
              } else {
                const value = {};
                if (X) value.x = x.invert ? X.map(x.invert).sort(ascending) : X;
                if (Y) value.y = y.invert ? Y.map(y.invert).sort(ascending) : Y;
                if ("fx" in scales) value.fx = index.fx;
                if ("fy" in scales) value.fy = index.fy;
                context.dispatchValue(value);
              }
            }
          });

        states.set(svg, (state = {brush, cancels: [], selection: null}));
      }
      const {brush, cancels} = state;
      const display = next.call(this, [], scales, values, dimensions, context);

      // Create a wrapper for the elements to display, and a target that will
      // carry the brush. Save references to the display and index of the current
      // facet.
      const wrapper = create("svg:g", context).attr("aria-label", display.getAttribute("aria-label"));
      const target = create("svg:g", context).attr("aria-label", "brush").datum({display, index}).call(brush);
      display.removeAttribute("aria-label");
      wrapper.append(() => display);
      cancels[index.fi ?? 0] = () => target.call(brush.move, null);

      // When the plot is complete, append the target element to the top
      // (z-index), translate it to match the facet’s frame position, and
      // initialize the plot’s value.
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          select(svg)
            .append(() => target.node())
            .attr("transform", wrapper.attr("transform"));
          context.dispatchValue(null);
        });
      }

      return wrapper.node();
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
