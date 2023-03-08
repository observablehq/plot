import type {CurveFactory, CurveBundleFactory, CurveCardinalFactory, CurveCatmullRomFactory} from "d3";

export type CurveFunction = CurveFactory | CurveBundleFactory | CurveCardinalFactory | CurveCatmullRomFactory;

export type CurveName =
  | "auto" // TODO only in certain contexts?
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
