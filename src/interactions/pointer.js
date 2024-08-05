import {pointer as pointof} from "d3";
import {composeRender} from "../mark.js";
import {isArray} from "../options.js";
import {applyFrameAnchor} from "../style.js";

const states = new WeakMap();

function pointerK(kx, ky, {x, y, px, py, maxRadius = 40, channels, render, ...options} = {}) {
  maxRadius = +maxRadius;
  // When px or py is used, register an extra channel that the pointer
  // interaction can use to control which point is focused; this allows pointing
  // to function independently of where the downstream mark (e.g., a tip) is
  // displayed. Also default x or y to null to disable maybeTuple etc.
  if (px != null) (x ??= null), (channels = {...channels, px: {value: px, scale: "x"}});
  if (py != null) (y ??= null), (channels = {...channels, py: {value: py, scale: "y"}});
  return {
    x,
    y,
    channels,
    ...options,
    // Unlike other composed transforms, the render transform must be the
    // outermost render function because it will re-render dynamically in
    // response to pointer events.
    render: composeRender(function (index, scales, values, dimensions, context, next) {
      context = {...context, pointerSticky: false};
      const svg = context.ownerSVGElement;
      const {data} = context.getMarkState(this);

      // Isolate state per-pointer, per-plot; if the pointer is reused by
      // multiple marks, they will share the same state (e.g., sticky modality).
      let state = states.get(svg);
      if (!state) states.set(svg, (state = {sticky: false, roots: [], renders: []}));

      // This serves as a unique identifier of the rendered mark per-plot; it is
      // used to record the currently-rendered elements (state.roots) so that we
      // can tell when a rendered element is clicked on.
      let renderIndex = state.renders.push(render) - 1;

      // For faceting, we want to compute the local coordinates of each point,
      // which means subtracting out the facet translation, if any. (It’s
      // tempting to do this using the local coordinates in SVG, but that’s
      // complicated by mark-specific transforms such as dx and dy.) Also, since
      // band scales return the upper bound of the band, we have to offset by
      // half the bandwidth.
      const {x, y, fx, fy} = scales;
      let tx = fx ? fx(index.fx) - dimensions.marginLeft : 0;
      let ty = fy ? fy(index.fy) - dimensions.marginTop : 0;
      if (x?.bandwidth) tx += x.bandwidth() / 2;
      if (y?.bandwidth) ty += y.bandwidth() / 2;

      // For faceting, we also need to record the closest point per facet per
      // mark (!), since each facet has its own pointer event listeners; we only
      // want the closest point across facets to be visible.
      const faceted = index.fi != null;
      let facetState;
      if (faceted) {
        let facetStates = state.facetStates;
        if (!facetStates) state.facetStates = facetStates = new Map();
        facetState = facetStates.get(this);
        if (!facetState) facetStates.set(this, (facetState = new Map()));
      }

      // The order of precedence for the pointer position is: px & py; the
      // middle of x1 & y1 and x2 & y2; or x1 & y1 (e.g., area); or lastly x &
      // y. If a dimension is unspecified, the frame anchor is used.
      const [cx, cy] = applyFrameAnchor(this, dimensions);
      const {px: PX, py: PY} = values;
      const px = PX ? (i) => PX[i] : anchorX(values, cx);
      const py = PY ? (i) => PY[i] : anchorY(values, cy);

      let i; // currently focused index
      let g; // currently rendered mark
      let s; // currently rendered stickiness
      let f; // current animation frame

      // When faceting, if more than one pointer would be visible, only show
      // this one if it is the closest. We defer rendering using an animation
      // frame to allow all pointer events to be received before deciding which
      // mark to render; although when hiding, we render immediately.
      function update(ii, ri) {
        if (faceted) {
          if (f) f = cancelAnimationFrame(f);
          if (ii == null) facetState.delete(index.fi);
          else {
            facetState.set(index.fi, ri);
            f = requestAnimationFrame(() => {
              f = null;
              for (const [fi, r] of facetState) {
                if (r < ri || (r === ri && fi < index.fi)) {
                  ii = null;
                  break;
                }
              }
              render(ii);
            });
            return;
          }
        }
        render(ii);
      }

      function render(ii) {
        if (i === ii && s === state.sticky) return; // the tooltip hasn’t moved
        i = ii;
        s = context.pointerSticky = state.sticky;
        const I = i == null ? [] : [i];
        if (faceted) (I.fx = index.fx), (I.fy = index.fy), (I.fi = index.fi);
        const r = next(I, scales, values, dimensions, context);
        if (g) {
          // When faceting, preserve swapped mark and facet transforms; also
          // remove ARIA attributes since these are promoted to the parent. This
          // is perhaps brittle in that it depends on how Plot renders facets,
          // but it produces a cleaner and more accessible SVG structure.
          if (faceted) {
            const p = g.parentNode;
            const ft = g.getAttribute("transform");
            const mt = r.getAttribute("transform");
            ft ? r.setAttribute("transform", ft) : r.removeAttribute("transform");
            mt ? p.setAttribute("transform", mt) : p.removeAttribute("transform");
            r.removeAttribute("aria-label");
            r.removeAttribute("aria-description");
            r.removeAttribute("aria-hidden");
          }
          g.replaceWith(r);
        }
        state.roots[renderIndex] = g = r;

        // Dispatch the value. When simultaneously exiting this facet and
        // entering a new one, prioritize the entering facet.
        if (!(i == null && facetState?.size > 1)) {
          const value = i == null ? null : isArray(data) ? data[i] : data.get(i);
          context.dispatchValue(value);
        }

        return r;
      }

      // Select the closest point to the mouse in the current facet; for
      // pointerX or pointerY, the orthogonal component of the distance is
      // squashed, selecting primarily on the dominant dimension. Across facets,
      // use unsquashed distance to determine the winner.
      function pointermove(event) {
        if (state.sticky || (event.pointerType === "mouse" && event.buttons === 1)) return; // dragging
        let [xp, yp] = pointof(event);
        (xp -= tx), (yp -= ty); // correct for facets and band scales
        const kpx = xp < dimensions.marginLeft || xp > dimensions.width - dimensions.marginRight ? 1 : kx;
        const kpy = yp < dimensions.marginTop || yp > dimensions.height - dimensions.marginBottom ? 1 : ky;
        let ii = null;
        let ri = maxRadius * maxRadius;
        for (const j of index) {
          const dx = kpx * (px(j) - xp);
          const dy = kpy * (py(j) - yp);
          const rj = dx * dx + dy * dy;
          if (rj <= ri) (ii = j), (ri = rj);
        }
        if (ii != null && (kx !== 1 || ky !== 1)) {
          const dx = px(ii) - xp;
          const dy = py(ii) - yp;
          ri = dx * dx + dy * dy;
        }
        update(ii, ri);
      }

      function pointerdown(event) {
        if (event.pointerType !== "mouse") return;
        if (i == null) return; // not pointing
        if (state.sticky && state.roots.some((r) => r?.contains(event.target))) return; // stay sticky
        if (state.sticky) (state.sticky = false), state.renders.forEach((r) => r(null)); // clear all pointers
        else (state.sticky = true), render(i);
        event.stopImmediatePropagation(); // suppress other pointers
      }

      function pointerleave(event) {
        if (event.pointerType !== "mouse") return;
        if (!state.sticky) update(null);
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
    }, render)
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

export function anchorX({x1: X1, x2: X2, x: X = X1}, cx) {
  return X1 && X2 ? (i) => (X1[i] + X2[i]) / 2 : X ? (i) => X[i] : () => cx;
}

export function anchorY({y1: Y1, y2: Y2, y: Y = Y1}, cy) {
  return Y1 && Y2 ? (i) => (Y1[i] + Y2[i]) / 2 : Y ? (i) => Y[i] : () => cy;
}
