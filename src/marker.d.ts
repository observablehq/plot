export type MarkerName = "none" | "arrow" | "dot" | "circle" | "circle-fill" | "circle-stroke";

export type MarkerImplementation = (color: string, context: {document: Document}) => SVGElement;

export type MarkerSpec = MarkerName | MarkerImplementation | boolean | null;
