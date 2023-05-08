import {pointer as pointof} from "d3";
import {applyFrameAnchor} from "../style.js";

function pointerK(kx, ky, {px, py, maxRadius = 40, channels, ...options} = {}) {
  maxRadius = +maxRadius;
  if (px != null) channels = {...channels, px: {value: px, scale: "x"}};
  if (py != null) channels = {...channels, py: {value: py, scale: "y"}};
  return {
    channels,
    ...options,
    render(index, scales, values, dimensions, context) {
      const mark = this;
      const svg = context.ownerSVGElement;
      const faceted = index.fi != null;
      const facetState = faceted ? getFacetState(mark, svg) : null;
      const {x: X0, y: Y0, x1: X1, y1: Y1, x2: X2, y2: Y2, px: X = X0, py: Y = Y0} = values;
      const [cx, cy] = applyFrameAnchor(this, dimensions);
      let sticky = false;
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
          }
          g.replaceWith(r);
        }
        return (g = r);
      }

      function pointermove(event) {
        if (sticky || (event.pointerType === "mouse" && event.buttons === 1)) return; // dragging
        const [xp, yp] = pointof(event, faceted ? g : g.parentNode);
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
        if (sticky && g.contains(event.target)) return; // stay sticky
        if (sticky) (sticky = false), render(null);
        else if (i != null) sticky = true;
      }

      function pointerleave(event) {
        if (event.pointerType !== "mouse") return;
        if (!sticky) render(null);
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

const facetStateByMark = new WeakMap();

// This isolates facet state per-mark, per-plot. Most of the time a separate
// pointer will be instantiated per mark, but it’s possible to reuse the same
// pointer instance with multiple marks so we protect against it.
function getFacetState(mark, svg) {
  let stateBySvg = facetStateByMark.get(mark);
  if (!stateBySvg) facetStateByMark.set(mark, (stateBySvg = new WeakMap()));
  let state = stateBySvg.get(svg);
  if (!state) stateBySvg.set(svg, (state = new Map()));
  return state;
}
