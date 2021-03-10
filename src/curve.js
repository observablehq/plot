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

const curves = new Map([
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

export function Curve(curve = curveLinear, tension) {
  if (typeof curve === "function") return curve; // custom curve
  const c = curves.get((curve + "").toLowerCase());
  if (!c) throw new Error(`unknown curve: ${curve}`);
  if (tension !== undefined) {
    switch (c) {
      case curveBundle: return c.beta(tension);
      case curveCardinalClosed:
      case curveCardinalOpen:
      case curveCardinal: return c.tension(tension);
      case curveCatmullRomClosed:
      case curveCatmullRomOpen:
      case curveCatmullRom: return c.alpha(tension);
    }
  }
  return c;
}
