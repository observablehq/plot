import {group} from "d3-array";
import {contourDensity} from "d3-contour";
import {geoPath} from "d3-geo";
import {create} from "d3-selection";
import {first, second} from "../mark.js";
import {filter, nonempty} from "../defined.js";
import {Mark, number, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles} from "../style.js";

export class Density extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      z,
      fill,
      stroke,
      title,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0,
      transform,
      ...style
    } = {}
  ) {
    const [vfill, cfill = vfill == null ? "none" : undefined] = maybeColor(fill);
    const [vstroke, cstroke = vstroke == null && cfill === "none" ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "title", value: title, optional: true}
      ],
      transform
    );
    Style(this, {fill: cfill, stroke: cstroke, ...style});
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(
    I,
    {x, y, color},
    {d: D, x: X, y: Y, z: Z, fill: F, stroke: S, title: L},
    {height, width}
  ) {
    let index = filter(I, D, F, S);
    const contours = contourDensity().size([width, height]).x(i => x(X[i])).y(i => y(Y[i]));
    const series = Z ? group(index, i => Z[i]).values() : [I];
    const path = geoPath();

    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(g => g.selectAll()
          .data(series)
          .join("g")
          .selectAll()
            .data(values => {
              const c = contours(values);
              return c.map(d => Object.assign(d, {values, opacity: 1 / c.length}));
            })
            .join("path")
              .call(applyDirectStyles, this)
              .attr("d", path)
              .attr("fill", F && (d => color(F[d.values[0]])))
              .attr("fill-opacity", d => d.opacity)
              .attr("stroke", S && (d => color(S[d.values[0]])))
              .call(L ? path => path
                .filter(([i]) => nonempty(L[i]))
                .append("title")
                .text(([i]) => L[i]) : () => {})
		)
        .node();
  }
}

export function density(data, options) {
  return new Density(data, options);
}
