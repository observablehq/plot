import {scaleTime, scaleUtc} from "d3";
import {ScaleQ} from "./quantitative.js";

function ScaleT(key, scale, channels, options) {
  return ScaleQ(key, scale, channels, options);
}

export function ScaleTime(key, channels, options) {
  return ScaleT(key, scaleTime(), channels, options);
}

export function ScaleUtc(key, channels, options) {
  return ScaleT(key, scaleUtc(), channels, options);
}
