import type {Context, InstantiatedMark, MarkerFunction, MarkerOption, MarkerOptions, Selection} from "../api.js";
import type {Datum, index, Series} from "../data.js";

import {create} from "../context.js";

export function markers<T extends Datum, U extends Value>(
  mark: InstantiatedMark<T, U>,
  {marker, markerStart = marker, markerMid = marker, markerEnd = marker}: MarkerOptions = {}
) {
  mark.markerStart = maybeMarker(markerStart);
  mark.markerMid = maybeMarker(markerMid);
  mark.markerEnd = maybeMarker(markerEnd);
}

function maybeMarker(marker: MarkerOption) {
  if (marker == null || marker === false) return null;
  if (marker === true) return markerCircleFill;
  if (typeof marker === "function") return marker;
  switch (`${marker}`.toLowerCase()) {
    case "none":
      return null;
    case "arrow":
      return markerArrow;
    case "dot":
      return markerDot;
    case "circle":
    case "circle-fill":
      return markerCircleFill;
    case "circle-stroke":
      return markerCircleStroke;
  }
  throw new Error(`invalid marker: ${marker}`);
}

function markerArrow(color: string, document: Context["document"]) {
  return create("svg:marker", {document})
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("orient", "auto")
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .call((marker) => marker.append("path").attr("d", "M-1.5,-3l3,3l-3,3"))
    .node() as SVGElement;
}

function markerDot(color: string, document: Context["document"]) {
  return create("svg:marker", {document})
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("fill", color)
    .attr("stroke", "none")
    .call((marker) => marker.append("circle").attr("r", 2.5))
    .node() as SVGElement;
}

function markerCircleFill(color: string, document: Context["document"]) {
  return create("svg:marker", {document})
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("fill", color)
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .call((marker) => marker.append("circle").attr("r", 3))
    .node() as SVGElement;
}

function markerCircleStroke(color: string, document: Context["document"]) {
  return create("svg:marker", {document})
    .attr("viewBox", "-5 -5 10 10")
    .attr("markerWidth", 6.67)
    .attr("markerHeight", 6.67)
    .attr("fill", "white")
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .call((marker) => marker.append("circle").attr("r", 3))
    .node() as SVGElement;
}

let nextMarkerId = 0;

export function applyMarkers<T extends Datum, U extends Value>(
  path: Selection,
  mark: InstantiatedMark<T, U>,
  {stroke: S}: {stroke?: string[]} = {}
) {
  return applyMarkersColor(path, mark, S && ((i: index) => S[i]));
}

export function applyGroupedMarkers<T extends Datum, U extends Value>(
  path: Selection,
  mark: InstantiatedMark<T, U>,
  {stroke: S}: {stroke?: string[]} = {}
) {
  return applyMarkersColor(path, mark, S && (([i]: Series) => S[i]));
}

// we're cheating typescript here by using index & Series:
// the stroke function can be applied either on an individual or on a grouped mark;
// the datum on the path will be either an index or a Series.
// The stroke is either a color channel or a (non nullish) string constant.
type StrokeAttr = (i: index & Series) => string;
type IriColorMap = Map<string | null | undefined, string | undefined>;

function applyMarkersColor<T extends Datum, U extends Value>(
  path: Selection,
  {markerStart, markerMid, markerEnd, stroke}: InstantiatedMark<T, U>,
  strokeof: StrokeAttr = () => stroke as string
) {
  const iriByMarkerColor = new Map<MarkerFunction, IriColorMap>();

  function applyMarker(marker: MarkerFunction) {
    return function (this: SVGElement, i: index & Series) {
      const color = strokeof(i);
      let iriByColor = iriByMarkerColor.get(marker);
      if (!iriByColor) iriByMarkerColor.set(marker, (iriByColor = new Map()));
      let iri = iriByColor.get(color);
      if (!iri) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const node = this.parentNode!.insertBefore(marker(color, this.ownerDocument), this);
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
