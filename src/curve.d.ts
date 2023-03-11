import type {CurveFactory} from "d3";

export type CurveFunction = CurveFactory;

export type CurveName =
  | "basis"
  | "basis-closed"
  | "basis-open"
  | "bundle"
  | "bump-x"
  | "bump-y"
  | "cardinal"
  | "cardinal-closed"
  | "cardinal-open"
  | "catmull-rom"
  | "catmull-rom-closed"
  | "catmull-rom-open"
  | "linear"
  | "linear-closed"
  | "monotone-x"
  | "monotone-y"
  | "natural"
  | "step"
  | "step-after"
  | "step-before";

export type Curve = CurveName | CurveFunction;

export interface CurveOptions {
  curve?: CurveOptions;
  tension?: number;
}

export interface CurveAutoOptions {
  curve?: Curve | "auto";
  tension?: number;
}
