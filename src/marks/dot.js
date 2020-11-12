import {create} from "d3-selection";

const first = d => d[0];
const second = d => d[1];
const unit = () => 1;

export class Dot {
  constructor({
    x = first,
    y = second,
    r = unit, // TODO Allow constant?
    fill = "none", // TODO Allow function?
    fillOpacity,
    stroke = "currentColor",
    strokeWidth = 1.5,
    strokeOpacity,
    mixBlendMode
  } = {}) {
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
    this.channels = {
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      r: {value: r, scale: "r"}
    };
  }
  render({x: {scale: x}, y: {scale: y}, r: {scale: r}}) {
    const {
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y},
        r: {value: R}
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
            .filter(i => X[i] != null && Y[i] != null && R[i] != null)) // TODO Number.isNaN?
          .join("circle")
            .style("mix-blend-mode", mixBlendMode)
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", i => r(R[i])))
      .node();
  }
}
