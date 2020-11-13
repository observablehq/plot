import {group} from "d3-array";
import {create} from "d3-selection";
import {line} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";

const indexOf = (d, i) => i;
const identity = d => d;

class Line {
  constructor({
    x,
    y,
    z, // grouping for multiple series
    curve,
    fill = "none",
    fillOpacity,
    stroke = "currentColor",
    strokeWidth = z ? 1 : 1.5,
    strokeMiterlimit = 1,
    strokeLinecap,
    strokeLinejoin,
    strokeDasharray,
    strokeOpacity,
    mixBlendMode
  } = {}) {
    this.curve = Curve(curve);
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeMiterlimit = strokeMiterlimit;
    this.strokeLinecap = strokeLinecap;
    this.strokeLinejoin = strokeLinejoin;
    this.strokeDasharray = strokeDasharray;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
    this.channels = {
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      z: z && {value: z}
    };
  }
  render({x: {scale: x}, y: {scale: y}}) {
    const {
      curve,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeMiterlimit,
      strokeLinecap,
      strokeLinejoin,
      strokeDasharray,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y},
        z: {value: Z} = {}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("X and Y are different length");
    if (Z && length !== Z.length) throw new Error("X and Z are different length");
    const I = Array.from(X, (_, i) => i);

    function style() {
      if (fill != null) this.setAttribute("fill", fill);
      if (fillOpacity != null) this.setAttribute("fill-opacity", fillOpacity);
      if (stroke != null) this.setAttribute("stroke", stroke);
      if (strokeWidth != null) this.setAttribute("stroke-width", strokeWidth);
      if (strokeMiterlimit != null) this.setAttribute("stroke-miterlimit", strokeMiterlimit);
      if (strokeLinecap != null) this.setAttribute("stroke-linecap", strokeLinecap);
      if (strokeLinejoin != null) this.setAttribute("stroke-linejoin", strokeLinejoin);
      if (strokeDasharray != null) this.setAttribute("stroke-dasharray", strokeDasharray);
      if (strokeOpacity != null) this.setAttribute("stroke-opacity", strokeOpacity);
    }

    function path(I) {
      if (mixBlendMode != null) this.style.mixBlendMode = mixBlendMode;
      this.setAttribute("d", line()
          .curve(curve)
          .defined(i => defined(X[i]) && defined(Y[i]))
          .x(i => x(X[i]))
          .y(i => y(Y[i]))
        (I));
    }

    if (Z) {
      return create("svg:g")
          .each(style)
          .call(g => g.selectAll()
            .data(group(I, i => Z[i]).values())
            .join("path")
            .each(path))
        .node();
    }

    return create("svg:path")
        .datum(I)
        .each(style)
        .each(path)
      .node();
  }
}

export class LineX extends Line {
  constructor({x = identity, y = indexOf, ...options} = {}) {
    super({...options, x, y});
  }
}

export class LineY extends Line {
  constructor({x = indexOf, y = identity, ...options} = {}) {
    super({...options, x, y});
  }
}
