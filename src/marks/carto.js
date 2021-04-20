import {ascending} from "d3";
import {geoPath} from "d3";
import {create} from "d3";
import {identity} from "../mark.js";
import {filter, nonempty, positive} from "../defined.js";
import {Mark, number, maybeColor, maybeNumber} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles} from "../style.js";

export class Carto extends Mark {
  constructor(
    data,
    {
      feature = identity,
      z,
      r,
      fill,
      stroke,
      title,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0,
      ...options
    } = {}
  ) {
    const [vr, cr = vr == null ? 3 : undefined] = maybeNumber(r);
    const [vfill, cfill = vfill == null ? "none" : undefined] = maybeColor(fill);
    const [vstroke, cstroke = vstroke == null && cfill === "none" ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "d", value: feature, scale: "projection", label: feature.label},
        {name: "z", value: z, optional: true},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "title", value: title, optional: true}
      ],
      options
    );
    Style(this, {fill: cfill, stroke: cstroke, ...options});
    this.r = cr;
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(
    I,
    {projection: {projection}},
    {d: D, z: Z, r: R, fill: F, stroke: S, strokeWidth: LW, title: L},
    {height, marginBottom, marginLeft, marginRight, marginTop, width}
  ) {
    let index = filter(I, D, F, S);
    if (R) index = index.filter(i => positive(R[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    
    if (projection.fitFeature) {
      projection.fitExtent([
        [marginLeft, marginTop],
        [width - marginRight, height - marginBottom]
      ], projection.fitFeature);
      delete projection.fitFeature;
    }
    const path = geoPath(projection).pointRadius(this.r);
    
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(g => g.selectAll()
          .data(I)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => (R ? path.pointRadius(R[i]) : path)(D[i]))
            .attr("fill", F && (i => F[i]))
            .attr("stroke", S && (i => S[i]))
            .attr("strokeWidth", LW && (i => LW[i]))
          .call(L ? path => path
            .filter(i => nonempty(L[i]))
            .append("title")
            .text(i => L[i]) : () => {}))
        .node();
  }
}

export function carto(data, options) {
  return new Carto(data, options);
}
