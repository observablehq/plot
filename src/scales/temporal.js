import {scaleSequential, scaleTime, scaleUtc} from "d3-scale";
import {ScaleQ} from "./quantitative.js";

export function ScaleTime(key, encodings, options) {
  return ScaleQ(
    key,
    (key === "color" ? scaleSequential : scaleTime)(),
    encodings,
    options
  );
}

export function ScaleUtc(key, encodings, options) {
  return ScaleQ(
    key,
    (key === "color" ? scaleSequential : scaleUtc)(),
    encodings,
    options
  );
}
