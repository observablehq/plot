import {create} from "./context.js";

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
  return applyMarkersColor(path, mark, S && ((i) => S[i]), context);
}

export function applyGroupedMarkers(path, mark, {stroke: S}, context) {
  return applyMarkersColor(path, mark, S && (([i]) => S[i]), context);
}

function applyMarkersColor(path, {markerStart, markerMid, markerEnd, stroke}, strokeof = () => stroke, context) {
  const iriByMarkerColor = new Map();

  function applyMarker(marker) {
    return function (i) {
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
      return iri;
    };
  }

  if (markerStart) path.attr("marker-start", applyMarker(markerStart));
  if (markerMid) path.attr("marker-mid", applyMarker(markerMid));
  if (markerEnd) path.attr("marker-end", applyMarker(markerEnd));
}
