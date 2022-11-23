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
    case "albers-usa": return geoAlbersUsa().scale(Math.min(1.34 * width, 2.14 * height)).translate([width / 2, height / 2]);
  }
  throw new Error(`invalid projection: ${projection}`);
}
