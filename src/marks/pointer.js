import {create, namespaces, pointer as pointerof, quickselect, union} from "d3";
import {identity, maybeFrameAnchor, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {selection} from "../selection.js";
import {applyDirectStyles, applyFrameAnchor, applyIndirectStyles} from "../style.js";

const defaults = {
  ariaLabel: "pointer",
  fill: "none",
  stroke: "#3b5fc0",
  strokeWidth: 1.5
};

export class Pointer extends Mark {
  constructor(data, {
    x,
    y,
    n = Infinity,
    r = isFinite(n) ? 120 : 20,
    mode = "auto",
    frameAnchor,
    ...options
  } = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true}
      ],
      options,
      defaults
    );
    this.n = +n;
    this.r = +r;
    this.mode = maybeMode(mode, x, y);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index, scales, {x: X, y: Y}, dimensions) {
    const {marginLeft, width, marginRight, marginTop, height, marginBottom} = dimensions;
    const {mode, n, r} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const r2 = r * r; // the squared radius; to determine points in proximity to the pointer
    const down = new Set(); // the set of pointers that are currently down
    let C = []; // a sparse index from index[i] to an svg:circle element
    let P = null; // the persistent selection; a subset of index, or null

    const g = create("svg:g");

    const parent = g.append("g")
        .call(applyIndirectStyles, this)
        .call(applyDirectStyles, this)
      .node();

    // Renders the given logical selection S, a subset of index. Applies
    // copy-on-write to the array of circles C. Returns true if the selection
    // changed, and false otherwise.
    function render(S) {
      const SC = [];
      let changed = false;

      // Enter (append) the newly-selected elements. The order of the circles is
      // arbitrary, with the most recently selected datum on top.
      S.forEach(i => {
        let c = C[i];
        if (!c) {
          c = document.createElementNS(namespaces.svg, "circle");
          c.setAttribute("id", i);
          c.setAttribute("r", 4);
          c.setAttribute("cx", X ? X[i] : cx);
          c.setAttribute("cy", Y ? Y[i] : cy);
          parent.appendChild(c);
          changed = true;
        }
        SC[i] = c;
      });

      // Exit (remove) the no-longer-selected elements.
      C.forEach((c, i) => {
        if (!SC[i]) {
          c.remove();
          changed = true;
        }
      });

      if (changed) C = SC;
      return changed;
    }

    // Selects the given logical selection S, a subset of index, or null if
    // there is no selection.
    function select(S) {
      if (S === null) render([]);
      else if (!render(S)) return;
      node[selection] = S;
      node.dispatchEvent(new Event("input", {bubbles: true}));
    }

    g.append("rect")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .attr("width", width + marginLeft + marginRight)
        .attr("height", height + marginTop + marginBottom)
        .on("pointerdown pointerover pointermove", event => {

          // On pointerdown, initiate a new persistent selection, P, or extend
          // the existing persistent selection if the shift key is down; then
          // add to P for as long as the pointer remains down. If there is no
          // existing persistent selection on pointerdown, initialize P to the
          // empty selection rather than the points near the pointer such that
          // you can clear the persistent selection with a pointerdown followed
          // by a pointerup. (See below.)
          if (event.type === "pointerdown") {
            const nop = !P;
            down.add(event.pointerId);
            if (nop || !event.shiftKey) P = [];
            if (!nop && !event.shiftKey) return select(P);
          }

          // If any pointer is down, only consider pointers that are down.
          if (P && !down.has(event.pointerId)) return;

          // Compute the current selection, S: the subset of index that is
          // logically selected. Normally this should be an in-order subset of
          // index, but it isn’t here because quickselect will reorder in-place
          // if the n option is used!
          const [mx, my] = pointerof(event);
          let S = index;
          switch (mode) {
            case "xy": {
              if (r < Infinity) {
                S = S.filter(i => {
                  const dx = X[i] - mx, dy = Y[i] - my;
                  return dx * dx + dy * dy <= r2;
                });
              }
              if (S.length > n) {
                S = S.slice();
                quickselect(S, n, undefined, undefined, (i, j) => {
                  const ix = X[i] - mx, iy = Y[i] - my;
                  const jx = X[j] - mx, jy = Y[j] - my;
                  return (ix * ix + iy * iy) - (jx * jx + jy * jy);
                });
                S = S.slice(0, n);
              }
              break;
            }
            case "x": {
              if (r < Infinity) {
                const [x0, x1] = [mx - r, mx + r];
                S = S.filter(i => x0 <= X[i] && X[i] <= x1);
              }
              if (S.length > n) {
                S = S.slice();
                quickselect(S, n, undefined, undefined, (i, j) => {
                  const ix = X[i] - mx;
                  const jx = X[j] - mx;
                  return ix * ix - jx * jx;
                });
                S = S.slice(0, n);
              }
              break;
            }
            case "y": {
              if (r < Infinity) {
                const [y0, y1] = [my - r, my + r];
                S = S.filter(i => y0 <= Y[i] && Y[i] <= y1);
              }
              if (S.length > n) {
                S = S.slice();
                quickselect(S, n, undefined, undefined, (i, j) => {
                  const iy = Y[i] - my;
                  const jy = Y[j] - my;
                  return iy * iy - jy * jy;
                });
                S = S.slice(0, n);
              }
              break;
            }
          }

          // If there is a persistent selection, add the new selection to the
          // persistent selection; otherwise just use the current selection.
          select(P ? (P = Array.from(union(P, S))) : S);
        })
        .on("pointerup", event => {
          // On pointerup, if the selection is empty, clear the persistent to
          // selection to allow the ephemeral selection on subsequent hover.
          if (!P.length) select(P = null);
          down.delete(event.pointerId);
        })
        .on("pointerout", () => {
          // On pointerout, if there is no persistent selection, clear the
          // ephemeral selection.
          if (!P) select(null);
        });

    const node = g.node();
    node[selection] = null;
    return node;
  }
}

function maybeMode(mode = "auto", x, y) {
  switch (mode = `${mode}`.toLowerCase()) {
    case "auto": mode = y == null ? "x" : x == null ? "y" : "xy"; break;
    case "x": case "y": case "xy": break;
    default: throw new Error(`invalid mode: ${mode}`);
  }
  if (/^x/.test(mode) && x == null) throw new Error("missing channel: x");
  if (/y$/.test(mode) && y == null) throw new Error("missing channel: y");
  return mode;
}

export function pointer(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Pointer(data, {...options, x, y});
}

export function pointerX(data, {mode = "x", x = identity, ...options} = {}) {
  return new Pointer(data, {...options, mode, x});
}

export function pointerY(data, {mode = "y", y = identity, ...options} = {}) {
  return new Pointer(data, {...options, mode, y});
}
