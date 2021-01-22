import {extent} from "d3-array";
import {defined} from "../defined.js";
import {group} from "../group.js";
import {maybeColor, range, valueof} from "../mark.js";
import {link} from "./link.js";

export function linearRegression(data, {stroke, x, y, z, ...options}) {
  let [vstroke, cstroke] = maybeColor(stroke, "currentColor");
  if (z === undefined && vstroke != null) z = vstroke;
  const X1 = [], Y1 = [], X2 = [], Y2 = [], S = vstroke ? [] : undefined; // lazily populated
  return link(data, {
    ...options,
    transform: (data, facets) => {
      x = valueof(data, x);
      y = valueof(data, y);
      z = z !== undefined ? valueof(data, z) : undefined;
      if (vstroke !== undefined) vstroke = valueof(data, vstroke);
      const [x1, x2] = extent(x);
      const index = [];
      let offset = 0;
      // TODO it’d be nice if faceting didn’t make this complicated
      for (let facet of facets === undefined ? [range(data.length)] : facets) {
        facet = facet.filter(i => defined(x[i]) && defined(y[i]));
        let n = 0;
        for (const index of z ? group(facet, z) : [facet]) {
          const f = linearRegressionLine(index, x, y);
          X1.push(x1), Y1.push(f(x1)), X2.push(x2), Y2.push(f(x2));
          if (S) S.push(vstroke[index[0]]);
          ++n;
        }
        index.push(range(offset, offset + n));
        offset += n;
      }
      return {index: facets === undefined ? index[0] : index};
    },
    x1: X1,
    y1: Y1,
    x2: X2,
    y2: Y2,
    stroke: cstroke ? cstroke : vstroke ? S : undefined
  });
}

function linearRegressionLine(I, X, Y) {
  const n = I.length;
  if (n === 1) return () => Y[I[0]];
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const i of I) {
    const x = X[i];
    const y = Y[i];
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const b = (sy - m * sx) / n;
  return x => b + m * x;
}
