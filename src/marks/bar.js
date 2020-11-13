import {create} from "d3-selection";

const indexOf = (d, i) => i;
const identity = d => d;

// TODO Bar vs. Column orientation?
// TODO In Bar orientation, enforce that x is a band scale.
// TODO In Column orientation, enforce that y is a band scale.
export class Bar {
  constructor({
    x = identity,
    y = indexOf,
    fill = "currentColor",
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    mixBlendMode,
    insetTop = 0,
    insetRight = 0,
    insetBottom = 0,
    insetLeft = 0
  } = {}) {
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
    this.insetTop = insetTop;
    this.insetRight = insetRight;
    this.insetBottom = insetBottom;
    this.insetLeft = insetLeft;
    this.channels = {
      _: {value: [0], scale: "x"},
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"}
    };
  }
  render({x: {scale: x}, y: {scale: y}}) {
    const {
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      insetTop,
      insetRight,
      insetBottom,
      insetLeft,
      channels: {
        x: {value: X},
        y: {value: Y}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("X and Y are different length");
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(Array.from(X, (_, i) => i)
            .filter(i => X[i] != null && Y[i] != null)) // TODO Number.isNaN?
          .join("rect")
            .style("mix-blend-mode", mixBlendMode)
            .attr("x", x(0) + insetLeft)
            .attr("width", i => Math.max(0, x(X[i]) - x(0) - insetLeft - insetRight)) // TODO negative
            .attr("y", i => y(Y[i]) + insetTop)
            .attr("height", Math.max(0, y.bandwidth() - insetTop - insetBottom)))
      .node();
  }
}
