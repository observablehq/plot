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

export function maybeProjection(projection, dimensions) {
  if (projection == null) return;
  if (typeof projection.stream === "function") return projection; // d3 projection
  let options;
  if (isObject(projection)) ({type: projection, ...options} = projection);
  if (typeof projection !== "function") projection = namedProjection(projection);
  return projection?.({...dimensions, ...options});
}

export function isProjection(projection) {
  if (projection == null) return false;
  if (typeof projection.stream === "function") return true; // d3 projection
  if (isObject(projection)) ({type: projection} = projection);
  if (typeof projection !== "function") projection = namedProjection(projection);
  return projection != null;
}

function namedProjection(projection) {
  switch (`${projection}`.toLowerCase()) {
    case "identity":
      return;
    case "equirectangular":
      return scaleProjection(geoEquirectangular, 6.28, 3.14);
    case "orthographic":
      return scaleProjection(geoOrthographic, 2, 2);
    case "stereographic":
      return scaleProjection(geoStereographic, 2, 2);
    case "mercator":
      return scaleProjection(geoMercator, 6.29, 6.29);
    case "equal-earth":
      return scaleProjection(geoEqualEarth, 5.42, 2.64);
    case "natural-earth":
      return scaleProjection(geoNaturalEarth1, 5.48, 2.85);
    case "albers-usa":
      return scaleProjection(geoAlbersUsa, 1 / 1.34, 1 / 2.14);
    default:
      throw new Error(`unknown projection type: ${projection}`);
  }
}

function scaleProjection(createProjection, kx, ky) {
  return ({width, height, marginTop, marginBottom, marginLeft, marginRight, rotate, precision = 0.15}) => {
    const frameWidth = width - marginLeft - marginRight;
    const frameHeight = height - marginTop - marginBottom;
    const projection = createProjection();
    if (precision != null) projection.precision?.(precision);
    if (rotate != null) projection.rotate?.(rotate);
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
