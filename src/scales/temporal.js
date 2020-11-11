import {scaleTime, scaleUtc} from "d3-scale";
import {ScaleQ} from "./quantitative.js";

export function ScaleTime(encodings, options) {
  return ScaleQ(scaleTime(), encodings, options);
}

export function ScaleUtc(encodings, options) {
  return ScaleQ(scaleUtc(), encodings, options);
}
