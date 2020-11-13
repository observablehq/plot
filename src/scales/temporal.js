import {scaleSequential, scaleTime, scaleUtc} from "d3-scale";
import {interpolateTurbo} from "d3-scale-chromatic";
import {ScaleQ} from "./quantitative.js";

export function ScaleTime(key, encodings, options) {
  return ScaleQ(
    key === "color"
      ? scaleSequential(interpolateTurbo)
      : scaleTime(),
    encodings,
    options
  );
}

export function ScaleUtc(key, encodings, options) {
  return ScaleQ(
    key === "color"
      ? scaleSequential(interpolateTurbo)
      : scaleUtc(),
    encodings,
    options
  );
}
