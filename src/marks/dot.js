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
      r,
      fill,
      stroke
    } = {},
    {
      r: fixedR = r === undefined ? 3 : undefined,
      fill: fixedFill = fill === undefined ? "none" : undefined,
      fillOpacity,
      stroke: fixedStroke = stroke === undefined && !fill ? "currentColor" : undefined,
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
        r: r && {value: r, scale: "r"},
        fill: fill && {value: fill, scale: "color"},
        stroke: stroke && {value: stroke, scale: "color"}
      }
    );
    this.r = fixedR;
    this.fill = fixedFill;
    this.fillOpacity = fillOpacity;
    this.stroke = fixedStroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
  }
  render(
    I,
    {
      x: {scale: x},
      y: {scale: y},
      r: {scale: r} = {},
      color: {scale: color} = {}
    }
  ) {
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
        r: {value: R} = {},
        fill: {value: F} = {},
        stroke: {value: S} = {}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("inconsistent channel length");
    if (R && length !== R.length) throw new Error("inconsistent channel length");
    if (F && length !== F.length) throw new Error("inconsistent channel length");
    if (S && length !== S.length) throw new Error("inconsistent channel length");
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(I.filter(i => defined(X[i]) && defined(Y[i])))
          .join("circle")
            .style("mix-blend-mode", mixBlendMode)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", R ? i => r(R[i]) : this.r))
      .node();
  }
}
