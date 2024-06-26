import {create} from "./context.js";
import {unset} from "./memoize.js";
import {keyof} from "./options.js";

export function markers(mark, {marker, markerStart = marker, markerMid = marker, markerEnd = marker} = {}) {
  mark.markerStart = maybeMarker(markerStart);
  mark.markerMid = maybeMarker(markerMid);
  mark.markerEnd = maybeMarker(markerEnd);
}

function maybeMarker(marker) {
  if (marker == null || marker === false) return null;
  if (marker === true) return markerCircleFill;
  if (typeof marker === "function") return marker;
  switch (`${marker}`.toLowerCase()) {
    case "none":
      return null;
    case "arrow":
      return markerArrow("auto");
    case "arrow-reverse":
      return markerArrow("auto-start-reverse");
    case "dot":
      return markerDot;
    case "circle":
    case "circle-fill":
      return markerCircleFill;
    case "circle-stroke":
      return markerCircleStroke;
    case "tick":
      return markerTick("auto");
    case "tick-x":
      return markerTick(90);
    case "tick-y":
      return markerTick(0);
  }
  throw new Error(`invalid marker: ${marker}`);
}

function markerArrow(orient) {
  return (color, context) =>
    create("svg:marker", context)
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("orient", orient)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .call((marker) => marker.append("path").attr("d", "M-1.5,-3l3,3l-3,3"))
      .node();
}

function markerDot(color, context) {
  return create("svg:marker", context)
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("fill", color)
    .attr("stroke", "none")
    .call((marker) => marker.append("circle").attr("r", 2.5))
    .node();
}

function markerCircleFill(color, context) {
  return create("svg:marker", context)
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("fill", color)
    .attr("stroke", "var(--plot-background)")
    .attr("stroke-width", 1.5)
    .call((marker) => marker.append("circle").attr("r", 3))
    .node();
}

function markerCircleStroke(color, context) {
  return create("svg:marker", context)
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("fill", "var(--plot-background)")
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .call((marker) => marker.append("circle").attr("r", 3))
    .node();
}

function markerTick(orient) {
  return (color, context) =>
    create("svg:marker", context)
      .attr("viewBox", "-3 -3 6 6")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", orient)
      .attr("stroke", color)
      .call((marker) => marker.append("path").attr("d", "M0,-3v6"))
      .node();
}

let nextMarkerId = 0;

export function applyMarkers(path, mark, {stroke: S}, context) {
  return applyMarkersColor(path, mark, S && ((i) => S[i]), null, context);
}

export function applyGroupedMarkers(path, mark, {stroke: S, z: Z}, context) {
  return applyMarkersColor(path, mark, S && (([i]) => S[i]), Z, context);
}

const START = 1;
const END = 2;

/**
 * When rendering lines or areas with variable aesthetics, a single series
 * produces multiple path elements. The first path element is a START segment;
 * the last path element is an END segment. When there is only a single path
 * element, it is both a START and an END segment.
 */
function getGroupedOrientation(path, Z) {
  const O = new Uint8Array(Z.length);
  const D = path.data().filter((I) => I.length > 1);
  const n = D.length;

  // Forward pass to find start segments.
  for (let i = 0, z = unset; i < n; ++i) {
    const I = D[i];
    if (I.length > 1) {
      const i = I[0];
      if (z !== (z = keyof(Z[i]))) O[i] |= START;
    }
  }

  // Backwards pass to find end segments.
  for (let i = n - 1, z = unset; i >= 0; --i) {
    const I = D[i];
    if (I.length > 1) {
      const i = I[0];
      if (z !== (z = keyof(Z[i]))) O[i] |= END;
    }
  }

  return ([i]) => O[i];
}

function applyMarkersColor(path, {markerStart, markerMid, markerEnd, stroke}, strokeof = () => stroke, Z, context) {
  if (!markerStart && !markerMid && !markerEnd) return;
  const iriByMarkerColor = new Map();
  const orient = Z && getGroupedOrientation(path, Z);

  function applyMarker(name, marker, filter) {
    return function (i) {
      if (filter && !filter(i)) return;
      const color = strokeof(i);
      let iriByColor = iriByMarkerColor.get(marker);
      if (!iriByColor) iriByMarkerColor.set(marker, (iriByColor = new Map()));
      let iri = iriByColor.get(color);
      if (!iri) {
        const node = this.parentNode.insertBefore(marker(color, context), this);
        const id = `plot-marker-${++nextMarkerId}`;
        node.setAttribute("id", id);
        iriByColor.set(color, (iri = `url(#${id})`));
      }
      this.setAttribute(name, iri);
    };
  }

  if (markerStart) path.each(applyMarker("marker-start", markerStart, orient && ((i) => orient(i) & START)));
  if (markerMid && orient) path.each(applyMarker("marker-start", markerMid, (i) => !(orient(i) & START)));
  if (markerMid) path.each(applyMarker("marker-mid", markerMid));
  if (markerEnd) path.each(applyMarker("marker-end", markerEnd, orient && ((i) => orient(i) & END)));
}
