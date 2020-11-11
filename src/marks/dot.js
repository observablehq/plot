import {create} from "d3-selection";

const first = d => d[0];
const second = d => d[1];

export class Dot {
  constructor({
    x = first,
    y = second,
    r = 2, // TODO as a channel? as area?
    fill = "none",
    fillOpacity,
    stroke = "currentColor",
    strokeWidth = 1.5,
    strokeOpacity,
    mixBlendMode
  } = {}) {
    this.r = r;
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
    this.channels = {
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"}
    };
  }
  render({x: {scale: x}, y: {scale: y}}) {
    const {
      r,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("X and Y are different length");
    const I = Array.from(X, (_, i) => i);

    function style() {
      if (fill != null) this.setAttribute("fill", fill);
      if (fillOpacity != null) this.setAttribute("fill-opacity", fillOpacity);
      if (stroke != null) this.setAttribute("stroke", stroke);
      if (strokeWidth != null) this.setAttribute("stroke-width", strokeWidth);
      if (strokeOpacity != null) this.setAttribute("stroke-opacity", strokeOpacity);
    }

    function circle(i) {
      if (mixBlendMode != null) this.style.mixBlendMode = mixBlendMode;
      this.setAttribute("cx", x(X[i]));
      this.setAttribute("cy", y(Y[i]));
      this.setAttribute("r", r);
    }

    return create("svg:g")
        .each(style)
        .call(g => g.selectAll()
          .data(I.filter(i => X[i] != null && Y[i] != null)) // TODO Number.isNaN?
          .join("circle")
          .each(circle))
      .node();
  }
}
