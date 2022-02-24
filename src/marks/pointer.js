import {create, namespaces, pointer as pointerof, quickselect, union} from "d3";
import {identity, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {selection} from "../selection.js";
import {applyDirectStyles, applyIndirectStyles} from "../style.js";

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
    n = 1,
    r = isFinite(n) ? 120 : 20,
    mode = "auto",
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
  }
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const {marginLeft, width, marginRight, marginTop, height, marginBottom} = dimensions;
    const {mode, n, r} = this;
    const r2 = r * r; // the squared radius; to determine points in proximity to the pointer
    const down = new Set(); // the set of pointers that are currently down
    let C = []; // a sparse index from index[i] to an svg:circle element
    let P = null; // the persistent selection; a subset of index, or null

    const g = create("svg:g");

    const parent = g.append("g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyDirectStyles, this)
      .node();

    // Note that point scales also expose a bandwidth function, but that always
    // returns zero. SVG will not render a stroked rect with zero width or
    // height, so we’ll render these as lines instead.
    const bx = x?.bandwidth?.();
    const by = y?.bandwidth?.();

    // The visual representation of the logical selection depends on which
    // channels are available (x, y, or both) and whether the corresponding
    // scales are band scales.
    const createElement = X && Y
      ? (bx && by ? i => element("rect", {x: X[i], y: Y[i], width: bx, height: by})
        : bx ? i => element("line", {x1: X[i], x2: X[i] + bx, y1: Y[i], y2: Y[i]})
        : by ? i => element("line", {x1: X[i], x2: X[i], y1: Y[i], y2: Y[i] + by})
        : i => element("circle", {cx: X[i], cy: Y[i], r: 4}))
      : X ? (bx ? i => element("rect", {x: X[i], y: marginTop, width: bx, height: height - marginBottom - marginTop})
        : i => element("line", {x1: X[i], x2: X[i], y1: marginTop, y2: height - marginBottom}))
      : (by ? i => element("rect", {x: marginLeft, y: Y[i], width: width - marginRight - marginLeft, height: by})
        : i => element("line", {y1: Y[i], y2: Y[i], x1: marginLeft, x2: width - marginRight}));

    // Renders the given logical selection S, a subset of index. Applies
    // copy-on-write to the array of elements C. Returns true if the selection
    // changed, and false otherwise.
    function render(S) {
      const SC = [];
      let changed = false;

      // Enter (append) the newly-selected elements. The order of elements is
      // arbitrary, with the most recently selected datum on top.
      S.forEach(i => {
        let c = C[i];
        if (!c) {
          c = createElement(i);
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

          // Adjust the pointer to account for band scales; for band scales, the
          // data is mapped to the start of the band (e.g., a bar’s left edge).
          let [mx, my] = pointerof(event);
          if (x.bandwidth) mx -= x.bandwidth() / 2;
          if (y.bandwidth) my -= y.bandwidth() / 2;

          // Compute the current selection, S: the subset of index that is
          // logically selected. Normally this should be an in-order subset of
          // index, but it isn’t here because quickselect will reorder in-place
          // if the n option is used!
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
          if (P && !P.length) select(P = null);
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

function element(name, attrs) {
  const e = document.createElementNS(namespaces.svg, name);
  for (const key in attrs) e.setAttribute(key, attrs[key]);
  return e;
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
