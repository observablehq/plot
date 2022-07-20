import {ISelection, IMark, IContext, MarkerOption, MarkerFunction, MaybeMarkerFunction} from "../common.js";

import {create} from "../context.js";

export function markers(mark: IMark, {
  marker,
  markerStart = marker,
  markerMid = marker,
  markerEnd = marker
}: {
  marker?: MarkerOption,
  markerStart?: MarkerOption,
  markerMid?: MarkerOption,
  markerEnd?: MarkerOption
} = {}) {
  mark.markerStart = maybeMarker(markerStart);
  mark.markerMid = maybeMarker(markerMid);
  mark.markerEnd = maybeMarker(markerEnd);
}

function maybeMarker(marker: MarkerOption): MaybeMarkerFunction {
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

function markerArrow(color: string, context: IContext) {
  return create("svg:marker", context)
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
    .node() as Element;
}

function markerDot(color: string, context: IContext) {
  return create("svg:marker", context)
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("fill", color)
      .attr("stroke", "none")
      .call(marker => marker.append("circle").attr("r", 2.5))
    .node() as Element;
}

function markerCircleFill(color: string, context: IContext) {
  return create("svg:marker", context)
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .call(marker => marker.append("circle").attr("r", 3))
    .node() as Element;
}

function markerCircleStroke(color: string, context: IContext) {
  return create("svg:marker", context)
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6.67)
      .attr("markerHeight", 6.67)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .call(marker => marker.append("circle").attr("r", 3))
    .node() as Element;
}

let nextMarkerId = 0;

export function applyMarkers(path: ISelection, mark: IMark, {stroke: S}: {stroke?: string[]} = {}) {
  return applyMarkersColor(path, mark, S && ((i: number) => S[i]));
}

export function applyGroupedMarkers(path: ISelection, mark: IMark, {stroke: S}: {stroke?: string[]} = {}) {
  return applyMarkersColor(path, mark, S && (([i]: number[]) => S[i]));
}

function applyMarkersColor(
  path: ISelection,
  {
    markerStart,
    markerMid,
    markerEnd,
    stroke
  }: IMark,
  strokeof: ((i: any) => string | undefined) = (() => stroke) // any is really number or number[]
) {
  const iriByMarkerColor = new Map();

  function applyMarker(marker: MarkerFunction) {
    return function(this: Element, i: number | [number]) {
      const color = strokeof(i);
      let iriByColor = iriByMarkerColor.get(marker);
      if (!iriByColor) iriByMarkerColor.set(marker, iriByColor = new Map());
      let iri = iriByColor.get(color);
      if (!iri) {
        const context = {document: this.ownerDocument};
        const node = (this.parentNode as Element).insertBefore(marker(color, context), this) as Element;
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
