import {geoAlbersUsa} from "d3";

// TODO
// - more named projections
// - apply x and y scales as linear projection by default?
// - disallow non-default projection if x and y scales exist?
export function maybeProjection(projection, dimensions) {
  if (projection == null) return;
  if (typeof projection === "function") return projection;
  const {width, height} = dimensions;
  switch (`${projection}`.toLowerCase()) {
    case "albers-usa":
      return geoAlbersUsa()
        .scale(Math.min(1.34 * width, 2.14 * height))
        .translate([width / 2, height / 2]);
  }
  throw new Error(`invalid projection: ${projection}`);
}

export function applyProjection(values, projection) {
  const {x, y} = values;
  if (x && y) {
    const n = x.length;
    const X = (values.x = new Float64Array(n));
    const Y = (values.y = new Float64Array(n));
    for (let i = 0; i < n; ++i) {
      const p = projection([x[i], y[i]]);
      if (p) (X[i] = p[0]), (Y[i] = p[1]);
      else X[i] = Y[i] = NaN;
    }
  }
}
