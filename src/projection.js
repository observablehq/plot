import {
  geoAlbersUsa,
  geoEqualEarth,
  geoEquirectangular,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  geoStereographic
} from "d3";
import {isObject} from "./options.js";

// TODO
// - gnomonic?
// - azimuthal equidistant?
// - azimuthal equal-area?
// - albers?
// - conic conformal?
// - conic equal area?
// - conic equidistant?
// - transverse mercator?
// - allow configuration of rotation?
// - allow configuration of parallels?
// - camelCase or hypen-separated?
// - more named projections?
// - apply x and y scales as linear projection by default?
// - disallow non-default projection if x and y scales exist?
export function maybeProjection(projection, dimensions) {
  if (projection == null) return;
  if (typeof projection === "function") return projection;
  const {width, height} = dimensions;
  let rotate, scale, precision;
  if (isObject(projection)) {
    ({type: projection, rotate, precision} = projection);
  }
  if (precision === undefined) precision = 0.15;
  switch (`${projection}`.toLowerCase()) {
    case "equirectangular":
      projection = geoEquirectangular;
      scale = Math.min(width / 6.28, height / 3.14);
      break;
    case "orthographic":
      projection = geoOrthographic;
      scale = Math.min(width, height) / 2;
      break;
    case "stereographic":
      projection = geoStereographic;
      scale = Math.min(width, height) / 2;
      break;
    case "mercator":
      projection = geoMercator;
      scale = Math.min(width, height) / 6.29;
      break;
    case "equal-earth":
      projection = geoEqualEarth;
      scale = Math.min(width / 5.42, height / 2.64);
      break;
    case "natural-earth":
      projection = geoNaturalEarth1;
      scale = Math.min(width / 5.48, height / 2.85);
      break;
    case "albers-usa":
      projection = geoAlbersUsa;
      scale = Math.min(1.34 * width, 2.14 * height);
      break;
    default:
      throw new Error(`invalid projection: ${projection}`);
  }
  projection = projection();
  projection.precision?.(precision);
  if (rotate != null) projection.rotate(rotate);
  return projection.scale(scale).translate([width / 2, height / 2]);
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
