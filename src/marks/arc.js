import {ascending} from "d3-array";
import {create} from "d3-selection";
import {arc as shapeArc} from "d3-shape";
import {filter} from "../defined.js";
import {Mark, number, maybeColor, maybeNumber, title} from "../mark.js";
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
      innerRadius = 0,
      outerRadius = 140,
      z,
      title,
      fill,
      stroke,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0,
      transform,
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill);
    const [vstroke, cstroke] = maybeColor(stroke);
    const [vx, cx = vx == null ? 0 : undefined] = maybeNumber(x);
    const [vy, cy = vy == null ? 0 : undefined] = maybeNumber(y);
    const [vri, cri = vri == null ? 0 : undefined] = maybeNumber(innerRadius);
    const [vro, cro = vro == null ? 0 : undefined] = maybeNumber(outerRadius);

    super(
      data,
      [
        {name: "x", value: vx, scale: "x"},
        {name: "y", value: vy, scale: "y"},
        {name: "startAngle", value: startAngle},
        {name: "endAngle", value: endAngle},
        {name: "innerRadius", value: innerRadius, optional: true},
        {name: "outerRadius", value: outerRadius, optional: true},
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
    this.ri = cri;
    this.ro = cro;
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(
    I,
    {x, y, color},
    {startAngle: A, endAngle: B, innerRadius: RI, outerRadius: RO, x: X, y: Y, z: Z, title: L, fill: F, stroke: S}
  ) {
    const index = filter(I, A, B, F, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    
    const arc = shapeArc()
      .startAngle(i => A[i])
      .endAngle(i => B[i])
      .innerRadius(i => RI[i] || this.ri)
      .outerRadius(i => RO[i] || this.ro);
      
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
