import {geoIdentity, geoMercator, geoOrthographic, geoEqualEarth} from "d3";

// TODO Allow this to be extended.
const projections = new Map([
  ["identity", geoIdentity],
  ["mercator", geoMercator],
  ["orthographic", geoOrthographic],
  ["equalEarth", geoEqualEarth]
]);

export function ScaleProjection(key, channels, { projection, rotate, precision }) {
  // TODO: use the channels to set up the projection's extent
  // note: we don't yet know the canvas dimensions…
  projection = typeof projection === "function" ? projection
    : (projections.get(projection) || geoMercator)();
  if (rotate && projection.rotate) projection.rotate(rotate);
  if (precision && projection.precision) projection.precision(precision);
  projection.fitFeature = channels[0].value[0] || {type:"Sphere"};
  return {type: "projection", scale: Object.assign(d => d, {projection})};
}
