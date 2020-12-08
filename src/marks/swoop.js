import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter} from "../defined.js";
import {Mark, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyBandTransform} from "../style.js";

var count = 0;

const ANGLE = Math.PI / 4;
const CLOCKWISE = 1;

function getPath(x1, y1, x2, y2) {
  // get the chord length between points
  const h = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  // get the distance at which chord of height h subtends {angle} radians
  const d = h / ( 2 * Math.tan(ANGLE / 2) );
  // get the radius {r} of the circumscribed circle
  const r = Math.sqrt(d ** 2 + (h / 2) ** 2);
  // build path string
  return `M ${x1} ${y1} A ${r} ${r} 0 0 ${CLOCKWISE} ${x2} ${y2}`;
}

export class Swoop extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vstroke, cstroke = vstroke == null ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y2", value: y2, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {stroke: cstroke, ...style});
  }
  render(
    I,
    {x, y, color},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, z: Z, stroke: S}
  ) {
    const index = filter(I, X1, Y1, X2, Y2, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    
    // Markers can't inherit stroke of line, so if stroke is a channel we have
    // to make a different marker for each!
    const markers = [];
    if (S) {
      for (let i of index) {
        markers.push([count++, color(S[i])]);
      }
    } else {
      markers.push([count++, null]);
    }

    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyBandTransform, x, y)
        .attr("fill", "none")
        .call(g => g.append("defs")
          .selectAll()
          .data(markers)
          .join("marker")
            .attr("id", d => `arrowhead${d[0]}`)
            .attr("viewBox", "-10 -10 20 20")
            .attr("refX", 0)
            .attr("refY", 0)
            .attr("markerWidth", 20)
            .attr("markerHeight", 20)
            .attr("stroke-width", 1)
            .attr("orient", "auto")
            .attr("fill", "none")
            .attr("stroke", d => d[1])
          .append("polyline")
            .attr("stroke-linejoin", "bevel")
            .attr("points", "-6.75,-6.75 0,0 -6.75,6.75"))
        .call(g => g.selectAll("line")
          .data(index)
          .join("path")
            .call(applyDirectStyles, this)
            .attr("d", i => getPath(x(X1[i]), y(Y1[i]), x(X2[i]), y(Y2[i])))
            .attr("stroke", S && (i => color(S[i])))
            .attr("marker-end", (d, i) => `url(#arrowhead${markers[markers.length > 1 ? i : 0][0]})`))
      .node();
  }
}

export function swoop(data, options) {
  return new Swoop(data, options);
}
