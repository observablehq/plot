import {ascending} from "d3-array";
import {create} from "d3-selection";
import {arc as shapeArc} from "d3-shape";
import {filter} from "../defined.js";
import {Mark, maybeColor, maybeNumber, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const constant = x => () => x;

export class Arc extends Mark {
  constructor(
    data,
    {
      startAngle = d => d.startAngle,
      endAngle = d => d.endAngle,
      x = constant(0),
      y = constant(0),
      innerRadius,
      outerRadius,
      padAngle,
      z,
      title,
      fill,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill, "currentColor");
    const [vstroke, cstroke] = maybeColor(stroke, cfill === "none" ? "currentColor" : cfill === "currentColor" ? "white" : "none");
    const [vsa, csa] = maybeNumber(startAngle, 0);
    const [vea, cea] = maybeNumber(endAngle, 2 * Math.PI);
    const [vpa, cpa] = maybeNumber(padAngle, 0);
    const [vx, cx] = maybeNumber(x, 0);
    const [vy, cy] = maybeNumber(y, 0);
    const [vri, cri] = maybeNumber(innerRadius, 0);
    const [vro, cro] = maybeNumber(outerRadius, 100);

    super(
      data,
      [
        {name: "x", value: vx, scale: "x", optional: true},
        {name: "y", value: vy, scale: "y", optional: true},
        {name: "startAngle", value: vsa, optional: true},
        {name: "endAngle", value: vea, optional: true},
        {name: "innerRadius", value: vri, optional: true},
        {name: "outerRadius", value: vro, optional: true},
        {name: "padAngle", value: vpa, optional: true},
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {fill: cfill, stroke: cstroke, ...style});
    this.x = cx;
    this.y = cy;
    this.sa = csa;
    this.ea = cea;
    this.ri = cri;
    this.ro = cro;
    this.pa = cpa;
  }
  render(
    I,
    {x, y, color},
    {startAngle: SA, endAngle: EA, innerRadius: RI, outerRadius: RO, padAngle: PA, x: X, y: Y, z: Z, title: L, fill: F, stroke: S},
    {marginTop, marginRight, marginBottom, marginLeft, width, height}
  ) {
    const index = filter(I, SA, EA, F, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    
    const r0 = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 200;
    
    const arc = shapeArc()
      .startAngle(SA ? (i => SA[i]) : this.sa)
      .endAngle(EA ? (i => EA[i]) : this.ea)
      .innerRadius(RI ? (i => r0 * RI[i]) : r0 * this.ri)
      .outerRadius(RO ? (i => r0 * RO[i]) : r0 * this.ro)
      .padAngle(PA ? (i => PA[i]) : this.pa);
    
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y)
        .call(g => g.selectAll()
          .data(index)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", arc)
            .attr("transform", i => `translate(${x(X[i])},${y(Y[i])})`)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
        .call(title(L)))
      .node();
  }
}

export function arc(data, options) {
  return new Arc(data, options);
}
