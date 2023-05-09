import {pointer as pointof} from "d3";
import {applyFrameAnchor} from "../style.js";

function pointerK(kx, ky, {x, y, px, py, maxRadius = 40, channels, ...options} = {}) {
  maxRadius = +maxRadius;
  if (px != null) (x ??= null), (channels = {...channels, px: {value: px, scale: "x"}});
  if (py != null) (y ??= null), (channels = {...channels, py: {value: py, scale: "y"}});
  const stateBySvg = new WeakMap();
  return {
    x,
    y,
    channels,
    ...options,
    render(index, scales, values, dimensions, context) {
      const mark = this;
      const svg = context.ownerSVGElement;

      // Isolate state per-pointer, per-plot; if the pointer is reused by
      // multiple marks, they will share the same state (e.g., sticky modality).
      let state = stateBySvg.get(svg);
      if (!state) stateBySvg.set(svg, (state = {sticky: false, roots: [], renders: []}));
      let renderIndex = state.renders.push(render) - 1;

      const faceted = index.fi != null;
      const facetState = faceted ? (state.facetState ??= new Map()) : null;
      const tx = scales.fx ? scales.fx(index.fx) - dimensions.marginLeft : 0;
      const ty = scales.fy ? scales.fy(index.fy) - dimensions.marginTop : 0;
      const {x: X0, y: Y0, x1: X1, y1: Y1, x2: X2, y2: Y2, px: X = X0, py: Y = Y0} = values;
      const [cx, cy] = applyFrameAnchor(this, dimensions);
      let i; // currently focused index
      let g; // currently rendered mark

      function render(ii, ri) {
        // When faceting, if more than one pointer would be visible, only show
        // this one if it is the closest. This is a simple linear scan because
        // we don’t expect many facets with simultaneously-visible pointers.
        if (faceted) {
          if (ii == null) {
            facetState.delete(index.fi);
          } else {
            facetState.set(index.fi, ri);
            if (facetState.size > 1) {
              for (const [fi, r] of facetState) {
                if (fi !== index.fi && r < ri) {
                  ii = null;
                  break;
                }
              }
            }
          }
        }
        if (i === ii) return; // the tooltip hasn’t moved
        i = ii;
        const I = i == null ? [] : [i];
        if (faceted) (I.fx = index.fx), (I.fy = index.fy), (I.fi = index.fi);
        const r = mark.render(I, scales, values, dimensions, context);
        if (g) {
          if (faceted) {
            // when faceting, preserve swapped mark and facet transforms
            const p = g.parentNode;
            const ft = g.getAttribute("transform");
            const mt = r.getAttribute("transform");
            ft ? r.setAttribute("transform", ft) : r.removeAttribute("transform");
            mt ? p.setAttribute("transform", mt) : p.removeAttribute("transform");
            // also remove ARIA attributes since these are promoted to the parent
            r.removeAttribute("aria-label");
            r.removeAttribute("aria-description");
            r.removeAttribute("aria-hidden");
          }
          g.replaceWith(r);
        }
        state.roots[renderIndex] = r;
        return (g = r);
      }

      function pointermove(event) {
        if (state.sticky || (event.pointerType === "mouse" && event.buttons === 1)) return; // dragging
        let [xp, yp] = pointof(event);
        if (faceted) (xp -= tx), (yp -= ty);
        let ii = null;
        let ri = maxRadius * maxRadius;
        for (const j of index) {
          const xj = X2 ? (X1[j] + X2[j]) / 2 : X ? X[j] : cx;
          const yj = Y2 ? (Y1[j] + Y2[j]) / 2 : Y ? Y[j] : cy;
          const dx = kx * (xj - xp);
          const dy = ky * (yj - yp);
          const rj = dx * dx + dy * dy;
          if (rj <= ri) (ii = j), (ri = rj);
        }
        render(ii, ri);
      }

      function pointerdown(event) {
        if (event.pointerType !== "mouse") return;
        if (i == null) return; // not pointing
        if (state.sticky && state.roots.some((r) => r?.contains(event.target))) return; // stay sticky
        if (state.sticky) (state.sticky = false), state.renders.forEach((r) => r(null)); // clear all pointers
        else state.sticky = true;
        event.stopImmediatePropagation(); // suppress other pointers
      }

      function pointerleave(event) {
        if (event.pointerType !== "mouse") return;
        if (!state.sticky) render(null);
      }

      // We listen to the svg element; listening to the window instead would let
      // us receive pointer events from farther away, but would also make it
      // hard to know when to remove the listeners. (Using a mutation observer
      // to watch the entire document is likely too expensive.)
      svg.addEventListener("pointerenter", pointermove);
      svg.addEventListener("pointermove", pointermove);
      svg.addEventListener("pointerdown", pointerdown);
      svg.addEventListener("pointerleave", pointerleave);

      return render(null);
    }
  };
}

export function pointer(options) {
  return pointerK(1, 1, options);
}

export function pointerX(options) {
  return pointerK(1, 0.01, options);
}

export function pointerY(options) {
  return pointerK(0.01, 1, options);
}
