import {
  geoAlbers,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEqualEarth,
  geoEquirectangular,
  geoGnomonic,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  geoStereographic,
  geoTransverseMercator
} from "d3";
import {isObject} from "./options.js";

export function maybeProjection(projection, dimensions) {
  if (projection == null) return;
  if (typeof projection.stream === "function") return projection; // d3 projection
  let options;
  if (isObject(projection)) ({type: projection, ...options} = projection);
  if (typeof projection !== "function") projection = namedProjection(projection);
  return projection?.({...dimensions, ...options});
}

export function hasProjection({projection} = {}) {
  if (projection == null) return false;
  if (typeof projection.stream === "function") return true; // d3 projection
  if (isObject(projection)) ({type: projection} = projection);
  if (typeof projection !== "function") projection = namedProjection(projection);
  return projection != null;
}

const pi = Math.PI;
const tau = 2 * pi;

function namedProjection(projection) {
  switch (`${projection}`.toLowerCase()) {
    case "albers-usa":
      return scaleProjection(geoAlbersUsa, 0.7463, 0.4673);
    case "albers":
      return scaleProjection(geoAlbers, 0.7463, 0.4673);
    case "azimuthal-equal-area":
      return scaleProjection(geoAzimuthalEqualArea, 4, 4);
    case "azimuthal-equidistant":
      return scaleProjection(geoAzimuthalEquidistant, tau, tau);
    case "conic-conformal":
      return scaleProjection(geoConicConformal, tau, tau);
    case "conic-equal-area":
      return scaleProjection(geoConicEqualArea, 6.1702, 2.9781);
    case "conic-equidistant":
      return scaleProjection(geoConicEquidistant, 7.312, 3.6282);
    case "equal-earth":
      return scaleProjection(geoEqualEarth, 5.4133, 2.6347);
    case "equirectangular":
      return scaleProjection(geoEquirectangular, tau, pi);
    case "gnomonic":
      return scaleProjection(geoGnomonic, 3.4641, 3.4641);
    case "identity":
      return;
    case "mercator":
      return scaleProjection(geoMercator, tau, tau);
    case "natural-earth":
      return scaleProjection(geoNaturalEarth1, 5.4708, 2.8448);
    case "orthographic":
      return scaleProjection(geoOrthographic, 2, 2);
    case "stereographic":
      return scaleProjection(geoStereographic, 2, 2);
    case "transverse-mercator":
      return scaleProjection(geoTransverseMercator, tau, tau);
    default:
      throw new Error(`unknown projection type: ${projection}`);
  }
}

function scaleProjection(createProjection, kx, ky) {
  return ({
    width,
    height,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    rotate,
    center,
    parallels,
    precision = 0.15
  }) => {
    const frameWidth = width - marginLeft - marginRight;
    const frameHeight = height - marginTop - marginBottom;
    const projection = createProjection();
    if (precision != null) projection.precision?.(precision);
    if (parallels != null) projection.parallels?.(parallels);
    if (rotate != null) projection.rotate?.(rotate);
    if (center != null) projection.center?.(center);
    projection.scale(Math.min(frameWidth / kx, frameHeight / ky));
    projection.translate([marginLeft + frameWidth / 2, marginTop + frameHeight / 2]);
    return projection;
  };
}

export function applyProjection(values, projection) {
  const {x, y} = values;
  const n = x.length;
  const X = (values.x = new Float64Array(n).fill(NaN));
  const Y = (values.y = new Float64Array(n).fill(NaN));
  let i;
  const stream = projection.stream({
    point(x, y) {
      X[i] = x;
      Y[i] = y;
    }
  });
  for (i = 0; i < n; ++i) {
    stream.point(x[i], y[i]);
  }
}
