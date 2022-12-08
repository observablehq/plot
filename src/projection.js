import {
  geoAlbers,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoClipRectangle,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEqualEarth,
  geoEquirectangular,
  geoGnomonic,
  geoMercator,
  geoOrthographic,
  geoPath,
  geoStereographic,
  geoTransform,
  geoTransverseMercator
} from "d3";
import {constant, isObject} from "./options.js";
import {warn} from "./warnings.js";

const pi = Math.PI;
const tau = 2 * pi;
const defaultAspectRatio = 0.618;

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
  let domain;
  let clip = "frame";

  // If the projection was specified as an object with additional options,
  // extract those. The order of precedence for insetTop (and other insets) is:
  // projection.insetTop, projection.inset, (global) insetTop, (global) inset.
  // Any other options on this object will be passed through to the initializer.
  if (isObject(projection)) {
    let inset;
    ({
      type: projection,
      domain,
      inset,
      insetTop = inset !== undefined ? inset : insetTop,
      insetRight = inset !== undefined ? inset : insetRight,
      insetBottom = inset !== undefined ? inset : insetBottom,
      insetLeft = inset !== undefined ? inset : insetLeft,
      clip = clip,
      ...options
    } = projection);
    if (projection == null) return;
  }

  // For named projections, retrieve the corresponding projection initializer.
  if (typeof projection !== "function") ({type: projection} = namedProjection(projection));

  // Compute the frame dimensions and invoke the projection initializer.
  const {width, height, marginLeft, marginRight, marginTop, marginBottom} = dimensions;
  const dx = width - marginLeft - marginRight - insetLeft - insetRight;
  const dy = height - marginTop - marginBottom - insetTop - insetBottom;
  projection = projection?.({width: dx, height: dy, clip, ...options});

  // The projection initializer might decide to not use a projection.
  if (projection == null) return;
  clip = maybePostClip(clip, marginLeft, marginTop, width - marginRight, height - marginBottom);

  // Translate the origin to the top-left corner, respecting margins and insets.
  let tx = marginLeft + insetLeft;
  let ty = marginTop + insetTop;
  let transform;

  // If a domain is specified, fit the projection to the frame.
  if (domain != null) {
    const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(domain);
    const k = Math.min(dx / (x1 - x0), dy / (y1 - y0));
    if (k > 0) {
      tx -= (k * (x0 + x1) - dx) / 2;
      ty -= (k * (y0 + y1) - dy) / 2;
      transform = geoTransform({
        point(x, y) {
          this.stream.point(x * k + tx, y * k + ty);
        }
      });
    } else {
      warn(`Warning: the projection could not be fit to the specified domain; using the default scale.`);
    }
  }

  transform ??=
    tx === 0 && ty === 0
      ? identity()
      : geoTransform({
          point(x, y) {
            this.stream.point(x + tx, y + ty);
          }
        });

  return {stream: (s) => projection.stream(transform.stream(clip(s)))};
}

function namedProjection(projection) {
  switch (`${projection}`.toLowerCase()) {
    case "albers-usa":
      return scaleProjection(geoAlbersUsa, 0.7463, 0.4673);
    case "albers":
      return conicProjection(geoAlbers, 0.7463, 0.4673);
    case "azimuthal-equal-area":
      return scaleProjection(geoAzimuthalEqualArea, 4, 4);
    case "azimuthal-equidistant":
      return scaleProjection(geoAzimuthalEquidistant, tau, tau);
    case "conic-conformal":
      return conicProjection(geoConicConformal, tau, tau);
    case "conic-equal-area":
      return conicProjection(geoConicEqualArea, 6.1702, 2.9781);
    case "conic-equidistant":
      return conicProjection(geoConicEquidistant, 7.312, 3.6282);
    case "equal-earth":
      return scaleProjection(geoEqualEarth, 5.4133, 2.6347);
    case "equirectangular":
      return scaleProjection(geoEquirectangular, tau, pi);
    case "gnomonic":
      return scaleProjection(geoGnomonic, 3.4641, 3.4641);
    case "identity":
      return {type: identity};
    case "reflect-y":
      return {type: reflectY};
    case "mercator":
      return scaleProjection(geoMercator, tau, tau);
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

function maybePostClip(clip, x1, y1, x2, y2) {
  if (clip === false || clip == null || typeof clip === "number") return (s) => s;
  if (clip === true) clip = "frame";
  switch (`${clip}`.toLowerCase()) {
    case "frame":
      return geoClipRectangle(x1, y1, x2, y2);
    default:
      throw new Error(`unknown projection clip type: ${clip}`);
  }
}

function scaleProjection(createProjection, kx, ky) {
  return {
    type: ({width, height, rotate, precision = 0.15, clip}) => {
      const projection = createProjection();
      if (precision != null) projection.precision?.(precision);
      if (rotate != null) projection.rotate?.(rotate);
      if (typeof clip === "number") projection.clipAngle?.(clip);
      projection.scale(Math.min(width / kx, height / ky));
      projection.translate([width / 2, height / 2]);
      return projection;
    },
    aspectRatio: ky / kx
  };
}

function conicProjection(createProjection, kx, ky) {
  const {type, aspectRatio} = scaleProjection(createProjection, kx, ky);
  return {
    type: (options) => {
      const {parallels, domain, width, height} = options;
      const projection = type(options);
      if (parallels != null) {
        projection.parallels(parallels);
        if (domain === undefined) {
          projection.fitSize([width, height], {type: "Sphere"});
        }
      }
      return projection;
    },
    aspectRatio
  };
}

const identity = constant({stream: (stream) => stream});

const reflectY = constant(
  geoTransform({
    point(x, y) {
      this.stream.point(x, -y);
    }
  })
);

// Applies a point-wise projection to the given paired x and y channels.
// Note: mutates values!
export function maybeProject(cx, cy, channels, values, context) {
  const x = channels[cx] && channels[cx].scale === "x";
  const y = channels[cy] && channels[cy].scale === "y";
  if (x && y) {
    project(cx, cy, values, context.projection);
  } else if (x) {
    throw new Error(`projection requires paired x and y channels; ${cx} is missing ${cy}`);
  } else if (y) {
    throw new Error(`projection requires paired x and y channels; ${cy} is missing ${cx}`);
  }
}

function project(cx, cy, values, projection) {
  const x = values[cx];
  const y = values[cy];
  const n = x.length;
  const X = (values[cx] = new Float64Array(n).fill(NaN));
  const Y = (values[cy] = new Float64Array(n).fill(NaN));
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

// When a named projection is specified, we can use its natural aspect ratio to
// determine a good value for the projection’s height based on the desired
// width. When we don’t have a way to know, the golden ratio is our best guess.
// Due to a circular dependency (we need to know the height before we can
// construct the projection), we have to test the raw projection option rather
// than the materialized projection; therefore we must be extremely careful that
// the logic of this function exactly matches Projection above!
export function projectionAspectRatio(projection, geometry) {
  if (typeof projection?.stream === "function") return defaultAspectRatio;
  if (isObject(projection)) projection = projection.type;
  if (projection == null) return geometry ? defaultAspectRatio : undefined;
  if (typeof projection !== "function") {
    const {aspectRatio} = namedProjection(projection);
    if (aspectRatio) return aspectRatio;
  }
  return defaultAspectRatio;
}
