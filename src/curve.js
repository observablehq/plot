import {curveBasis, curveLinear, curveStep} from "d3-shape";

export function Curve(curve = "linear") {
  switch (curve) {
    case "basis": return curveBasis;
    case "step": return curveStep;
    case "linear": return curveLinear;
    default: throw new Error(`unknown curve: ${curve}`);
  }
}
