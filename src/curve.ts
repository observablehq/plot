import {
  curveBasis,
  curveBasisClosed,
  curveBasisOpen,
  curveBundle,
  curveBumpX,
  curveBumpY,
  curveCardinal,
  curveCardinalClosed,
  curveCardinalOpen,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveCatmullRomOpen,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore
} from "d3";
import type {
  CurveFactory,
  CurveBundleFactory,
  CurveCardinalFactory,
  CurveCatmullRomFactory,
  CurveGenerator,
  Path
} from "d3";

type CurveFunction = CurveFactory | CurveBundleFactory | CurveCardinalFactory | CurveCatmullRomFactory;
type CurveName =
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

const curves = new Map<CurveName, CurveFunction>([
  ["basis", curveBasis],
  ["basis-closed", curveBasisClosed],
  ["basis-open", curveBasisOpen],
  ["bundle", curveBundle],
  ["bump-x", curveBumpX],
  ["bump-y", curveBumpY],
  ["cardinal", curveCardinal],
  ["cardinal-closed", curveCardinalClosed],
  ["cardinal-open", curveCardinalOpen],
  ["catmull-rom", curveCatmullRom],
  ["catmull-rom-closed", curveCatmullRomClosed],
  ["catmull-rom-open", curveCatmullRomOpen],
  ["linear", curveLinear],
  ["linear-closed", curveLinearClosed],
  ["monotone-x", curveMonotoneX],
  ["monotone-y", curveMonotoneY],
  ["natural", curveNatural],
  ["step", curveStep],
  ["step-after", curveStepAfter],
  ["step-before", curveStepBefore]
]);

export function Curve(curve: CurveName | CurveFunction = curveLinear, tension?: number): CurveFunction {
  if (typeof curve === "function") return curve; // custom curve
  const c = curves.get(`${curve}`.toLowerCase() as CurveName);
  if (!c) throw new Error(`unknown curve: ${curve}`);
  if (tension !== undefined) {
    if ("beta" in c) {
      return c.beta(tension);
    } else if ("tension" in c) {
      return c.tension(tension);
    } else if ("alpha" in c) {
      return c.alpha(tension);
    }
  }
  return c;
}

// For the “auto” curve, return a symbol instead of a curve implementation;
// we’ll use d3.geoPath to render if there’s a projection.
export function PathCurve(curve: CurveName | CurveFunction = curveAuto, tension?: number): CurveFunction {
  return typeof curve !== "function" && `${curve}`.toLowerCase() === "auto" ? curveAuto : Curve(curve, tension);
}

// This is a special built-in curve that will use d3.geoPath when there is a
// projection, and the linear curve when there is not. You can explicitly
// opt-out of d3.geoPath and instead use d3.line with the "linear" curve.
export function curveAuto(context: CanvasRenderingContext2D | Path): CurveGenerator {
  return curveLinear(context);
}
