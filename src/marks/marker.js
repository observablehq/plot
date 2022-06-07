import {create} from "d3";

export function markers(mark, {
  marker,
  markerStart = marker,
  markerMid = marker,
  markerEnd = marker
} = {}) {
  mark.markerStart = maybeMarker(markerStart);
  mark.markerMid = maybeMarker(markerMid);
  mark.markerEnd = maybeMarker(markerEnd);
}

function maybeMarker(marker) {
  if (marker == null || marker === false) return null;
  if (marker === true) return markerCircleFill;
  if (typeof marker === "function") return marker;
  switch (`${marker}`.toLowerCase()) {
    case "none": return null;
    case "arrow": return markerArrow;
    case "dot": return markerDot;
    case "circle": case "circle-fill": return markerCircleFill;
    case "circle-stroke": return markerCircleStroke;
  }
  throw new Error(`invalid marker: ${marker}`);
}

function markerArrow(color) {
  return create("svg:marker")
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("orient", "auto")
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .call(marker => marker.append("path").attr("d", "M-1.5,-3l3,3l-3,3"))
    .node();
}

function markerDot(color) {
  return create("svg:marker")
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("fill", color)
      .attr("stroke", "none")
      .call(marker => marker.append("circle").attr("r", 2.5))
    .node();
}

function markerCircleFill(color) {
  return create("svg:marker")
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .call(marker => marker.append("circle").attr("r", 3))
    .node();
}

function markerCircleStroke(color) {
  return create("svg:marker")
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .call(marker => marker.append("circle").attr("r", 3))
    .node();
}

let nextMarkerId = 0;

export function applyMarkers(path, mark, {stroke: S} = {}) {
  return applyMarkersColor(path, mark, S && (i => S[i]));
}

export function applyGroupedMarkers(path, mark, {stroke: S} = {}) {
  return applyMarkersColor(path, mark, S && (([i]) => S[i]));
}

function applyMarkersColor(path, {markerStart, markerMid, markerEnd, stroke}, strokeof = () => stroke) {
  const iriByMarkerColor = new Map();

  function applyMarker(marker) {
    return function(i) {
      const color = strokeof(i);
      let iriByColor = iriByMarkerColor.get(marker);
      if (!iriByColor) iriByMarkerColor.set(marker, iriByColor = new Map());
      let iri = iriByColor.get(color);
      if (!iri) {
        const node = this.parentNode.insertBefore(marker(color), this);
        const id = `plot-marker-${++nextMarkerId}`;
        node.setAttribute("id", id);
        iriByColor.set(color, iri = `url(#${id})`);
      }
      return iri;
    };
  }

  if (markerStart) path.attr("marker-start", applyMarker(markerStart));
  if (markerMid) path.attr("marker-mid", applyMarker(markerMid));
  if (markerEnd) path.attr("marker-end", applyMarker(markerEnd));
}
