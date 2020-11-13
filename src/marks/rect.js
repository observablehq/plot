import {create} from "d3-selection";

export class Rect {
  constructor({
    x1,
    y1,
    x2,
    y2,
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
      x1: {value: x1, scale: "x"},
      y1: {value: y1, scale: "y"},
      x2: {value: x2, scale: "x"},
      y2: {value: y2, scale: "y"}
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
        x1: {value: X1},
        y1: {value: Y1},
        x2: {value: X2},
        y2: {value: Y2}
      }
    } = this;
    const {length} = X1;
    if (length !== Y1.length) throw new Error("X1 and Y1 are different length");
    if (length !== X2.length) throw new Error("X1 and X2 are different length");
    if (length !== Y2.length) throw new Error("X1 and Y2 are different length");
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(Array.from(X1, (_, i) => i)
            .filter(i => X1[i] != null // TODO Number.isNaN?
              && Y1[i] != null
              && X2[i] != null
              && Y2[i] != null))
          .join("rect")
            .style("mix-blend-mode", mixBlendMode)
            .attr("x", i => x(X1[i]) + insetLeft)
            .attr("width", i => Math.max(0, x(X2[i]) - x(X1[i]) - insetLeft - insetRight)) // TODO negative
            .attr("y", i => y(Y2[i]) + insetTop)
            .attr("height", i => Math.max(0, y(Y1[i]) - y(Y2[i]) - insetTop - insetBottom)))
      .node();
  }
}
