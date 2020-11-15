import {scaleTime, scaleUtc} from "d3-scale";
import {ScaleQ} from "./quantitative.js";

export function ScaleTime(key, encodings, options) {
  return ScaleQ(key, scaleTime(), encodings, options);
}

export function ScaleUtc(key, encodings, options) {
  return ScaleQ(key, scaleUtc(), encodings, options);
}
