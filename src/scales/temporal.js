import {scaleTime, scaleUtc} from "d3-scale";
import {ScaleQ} from "./quantitative.js";

export function ScaleTime(key, channels, options) {
  return ScaleQ(key, scaleTime(), channels, options);
}

export function ScaleUtc(key, channels, options) {
  return ScaleQ(key, scaleUtc(), channels, options);
}
