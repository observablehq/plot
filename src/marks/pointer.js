import {create, namespaces, pointer as pointerof, quickselect} from "d3";
import {identity, maybeFrameAnchor, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {selection} from "../selection.js";
import {applyFrameAnchor} from "../style.js";

const defaults = {
  ariaLabel: "pointer"
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
    const r2 = r * r;
    let C = [];

    const g = create("svg:g")
        .attr("fill", "none");

    const parent = g.append("g")
        .attr("stroke", "#3b5fc0")
        .attr("stroke-width", 1.5)
      .node();

    g.append("rect")
        .attr("pointer-events", "all")
        .attr("width", width + marginLeft + marginRight)
        .attr("height", height + marginTop + marginBottom)
        .on("pointerover pointermove", (event) => {
          const [mx, my] = pointerof(event);

          // Compute the selection index S: the subset of index that is
          // logically selected. Note that while normally this should be an
          // in-order subset of index, it isn’t here if the n option is
          // specified because quickselect will reorder in-place!
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

          // Add a circle for any newly-selected datum; remove a circle for any
          // no-longer-selected datum. The order of these elements is arbitrary,
          // with the most recently selected datum on top.
          let C2 = [];
          let changed = false;
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
            C2[i] = c;
          });
          C.forEach((c, i) => {
            if (!C2[i]) {
              c.remove();
              changed = true;
            }
          });
          C = C2;

          // If the selection changed, emit an input event.
          if (changed) {
            node[selection] = S;
            node.dispatchEvent(new Event("input", {bubbles: true}));
          }
        })
        .on("pointerout", function() {
          C.forEach(c => c.remove());
          C = [];
          node[selection] = null;
          node.dispatchEvent(new Event("input", {bubbles: true}));
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
