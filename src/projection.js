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
  geoTransform,
  geoTransverseMercator
} from "d3";
import {isObject} from "./options.js";

export function Projection(
  {
    projection,
    inset: globalInset = 0,
    insetTop = globalInset,
    insetRight = globalInset,
    insetBottom = globalInset,
    insetLeft = globalInset
  } = {},
  dimensions
) {
  if (projection == null) return;
  if (typeof projection.stream === "function") return projection; // d3 projection
  let options;

  // If the projection was specified as an object with additional options,
  // extract those. The order of precedence for insetTop (and other insets) is:
  // projection.insetTop, projection.inset, (global) insetTop, (global) inset.
  // Any other options on this object will be passed through to the initializer.
  if (isObject(projection)) {
    let inset;
    ({
      type: projection,
      inset,
      insetTop = inset !== undefined ? inset : insetTop,
      insetRight = inset !== undefined ? inset : insetRight,
      insetBottom = inset !== undefined ? inset : insetBottom,
      insetLeft = inset !== undefined ? inset : insetLeft,
      ...options
    } = projection);
  }

  // For named projections, retrieve the corresponding projection initializer.
  if (typeof projection !== "function") projection = namedProjection(projection);

  // Compute the frame dimensions and invoke the projection initializer.
  const {width, height, marginLeft, marginRight, marginTop, marginBottom} = dimensions;
  const dx = width - marginLeft - marginRight - insetLeft - insetRight;
  const dy = height - marginTop - marginBottom - insetTop - insetBottom;
  projection = projection?.({width: dx, height: dy, ...options});

  // The projection initializer might decide to not use a projection.
  if (projection == null) return;

  // If there’s no need to translate, return the projection as-is for speed.
  // TODO Maybe scale to fit features here?
  const tx = marginLeft + insetLeft;
  const ty = marginTop + insetTop;
  if (tx === 0 && ty === 0) return projection;

  // Otherwise wrap the projection stream with a translate transform.
  const {stream: translate} = geoTransform({
    point(x, y) {
      this.stream.point(x + tx, y + ty);
    }
  });
  return {stream: (s) => projection.stream(translate(s))};
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
  return ({width, height, rotate, center, parallels, precision = 0.15}) => {
    const projection = createProjection();
    if (precision != null) projection.precision?.(precision);
    if (parallels != null) projection.parallels?.(parallels);
    if (rotate != null) projection.rotate?.(rotate);
    if (center != null) projection.center?.(center);
    projection.scale(Math.min(width / kx, height / ky));
    projection.translate([width / 2, height / 2]);
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
