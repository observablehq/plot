export type MarkerName = "arrow" | "dot" | "circle" | "circle-fill" | "circle-stroke";

export type MarkerFunction = (color: string, context: {document: Document}) => SVGElement;

export type Marker = MarkerName | MarkerFunction;

export interface MarkerOptions {
  marker?: Marker | "none" | boolean | null;
  markerStart?: Marker | "none" | boolean | null;
  markerMid?: Marker | "none" | boolean | null;
  markerEnd?: Marker | "none" | boolean | null;
}
