import {create, pointer as pointerof, quickselect} from "d3";
import {identity, maybeFrameAnchor, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {selection, selectionEquals} from "../selection.js";
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
    this.mode = mode === "auto" ? (x == null ? "y" : y == null ? "x" : "xy") : mode; // TODO maybe mode
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index, scales, {x: X, y: Y}, dimensions) {
    const {marginLeft, width, marginRight, marginTop, height, marginBottom} = dimensions;
    const {mode, n, r} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const r2 = r * r;
    const C = [];

    const g = create("svg:g")
        .style("color", "#3b5fc0")
        .attr("stroke-width", 1.5);

    g.append("g")
        .attr("fill", "none")
      .selectAll("circle")
      .data(index)
      .join("circle")
        .attr("r", 4)
        .attr("cx", X ? i => X[i] : cx)
        .attr("cy", Y ? i => Y[i] : cy)
        .each(function(i) { C[i] = this; });

    g.append("rect")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .attr("width", width + marginLeft + marginRight)
        .attr("height", height + marginTop + marginBottom)
        .on("pointerover pointermove", (event) => {
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
          C.forEach(c => c.setAttribute("stroke", "none"));
          S.forEach(i => C[i].setAttribute("stroke", "currentColor"));
          if (!selectionEquals(node[selection], S)) {
            node[selection] = S;
            node.dispatchEvent(new Event("input", {bubbles: true}));
          }
        })
        .on("pointerout", function() {
          C.forEach(c => c.setAttribute("stroke", "none"));
          node[selection] = null;
          node.dispatchEvent(new Event("input", {bubbles: true}));
        });

    const node = g.node();
    node[selection] = null;
    return node;
  }
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
