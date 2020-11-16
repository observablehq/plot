import {create} from "d3-selection";
import {defined} from "../defined.js";
import {Mark} from "../mark.js";

const first = d => d[0];
const second = d => d[1];

export class DotXY extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      r = () => 1, // TODO Allow constant?
      fill = "none", // TODO Allow function?
      fillOpacity,
      stroke = () => true, // TODO Allow constant?
      strokeWidth = 1.5,
      strokeOpacity,
      mixBlendMode
    } = {}
  ) {
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y"},
        r: {value: r, scale: "r"},
        stroke: {value: stroke, scale: "color"}
      }
    );
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
  }
  render(
    I,
    {
      x: {scale: x},
      y: {scale: y},
      r: {scale: r},
      color: {scale: color} = {}
    }
  ) {
    const {
      fill,
      fillOpacity,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y},
        r: {value: R},
        stroke: {value: S} = {}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("X and Y are different length");
    if (length !== R.length) throw new Error("X and R are different length");
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(I.filter(i => defined(X[i]) && defined(Y[i]) && defined(R[i])))
          .join("circle")
            .style("mix-blend-mode", mixBlendMode)
            .attr("stroke", S && (i => color(S[i])))
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", i => r(R[i])))
      .node();
  }
}
