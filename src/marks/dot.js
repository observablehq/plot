import {ascending} from "d3";
import {create} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, identity, maybeColor, maybeNumber, maybeTuple, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr} from "../style.js";

export class Dot extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z,
      r,
      title,
      fill,
      fillOpacity,
      stroke,
      strokeOpacity,
      ...options
    } = {}
  ) {
    const [vr, cr] = maybeNumber(r, 3);
    const [vfill, cfill] = maybeColor(fill, "none");
    const [vfillOpacity, cfillOpacity] = maybeNumber(fillOpacity);
    const [vstroke, cstroke] = maybeColor(stroke, cfill === "none" ? "currentColor" : "none");
    const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "fillOpacity", value: vfillOpacity, scale: "opacity", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true}
      ],
      options
    );
    this.r = cr;
    Style(this, {
      fill: cfill,
      fillOpacity: cfillOpacity,
      stroke: cstroke,
      strokeOpacity: cstrokeOpacity,
      strokeWidth: cstroke === "none" ? undefined : 1.5,
      ...options
    });
  }
  render(
    I,
    {x, y},
    {x: X, y: Y, z: Z, r: R, title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO},
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    let index = filter(I, X, Y, F, FO, S, SO);
    if (R) index = index.filter(i => positive(R[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", X ? i => X[i] : (marginLeft + width - marginRight) / 2)
            .attr("cy", Y ? i => Y[i] : (marginTop + height - marginBottom) / 2)
            .attr("r", R ? i => R[i] : this.r)
            .call(applyAttr, "fill", F && (i => F[i]))
            .call(applyAttr, "fill-opacity", FO && (i => FO[i]))
            .call(applyAttr, "stroke", S && (i => S[i]))
            .call(applyAttr, "stroke-opacity", SO && (i => SO[i]))
            .call(title(L)))
      .node();
  }
}

export function dot(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Dot(data, {...options, x, y});
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, y});
}
