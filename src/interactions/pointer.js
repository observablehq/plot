import {pointer as pointof} from "d3";
import {applyFrameAnchor} from "../style.js";

function pointerK(kx, ky, {maxRadius = 40, ...options} = {}) {
  maxRadius = +maxRadius;
  return {
    ...options,
    render(index, scales, values, dimensions, context) {
      const mark = this;
      const svg = context.ownerSVGElement;
      const {x: X, y: Y, x1: X1, y1: Y1, x2: X2, y2: Y2} = values;
      const [cx, cy] = applyFrameAnchor(this, dimensions);
      let sticky = false;
      let i; // currently focused index
      let g; // currently rendered mark

      function render(ii) {
        if (i === ii) return; // the tooltip hasn’t moved
        i = ii;
        const r = mark._render(i == null ? [] : [i], scales, values, dimensions, context);
        if (g) g.replaceWith(r);
        return (g = r);
      }

      function pointermove(event) {
        if (sticky || (event.pointerType === "mouse" && event.buttons === 1)) return; // dragging
        const rect = svg.getBoundingClientRect();
        let ii = null;
        if (
          // Check if the pointer is near before scanning.
          event.clientX + maxRadius > rect.left &&
          event.clientX - maxRadius < rect.right &&
          event.clientY + maxRadius > rect.top &&
          event.clientY - maxRadius < rect.bottom
        ) {
          const [xp, yp] = pointof(event, g.parentNode);
          let ri = maxRadius * maxRadius;
          for (const j of index) {
            const xj = X2 ? (X1[j] + X2[j]) / 2 : X ? X[j] : cx; // + oxj;
            const yj = Y2 ? (Y1[j] + Y2[j]) / 2 : Y ? Y[j] : cy; // + oyj;
            const dx = kx * (xj - xp);
            const dy = ky * (yj - yp);
            const rj = dx * dx + dy * dy;
            if (rj <= ri) (ii = j), (ri = rj);
          }
        }
        render(ii);
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
