import {curveLinear, curveStep} from "d3-shape";

export function Curve(curve = "linear") {
  switch (curve) {
    case "step": return curveStep;
    case "linear": return curveLinear;
    default: throw new Error(`unknown curve: ${curve}`);
  }
}
