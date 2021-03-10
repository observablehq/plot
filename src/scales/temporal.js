import {scaleTime, scaleUtc} from "d3";
import {ScaleQ} from "./quantitative.js";

function ScaleT(key, scale, channels, options) {
  const s = ScaleQ(key, scale, channels, options);
  s.type = "temporal";
  return s;
}

export function ScaleTime(key, channels, options) {
  return ScaleT(key, scaleTime(), channels, options);
}

export function ScaleUtc(key, channels, options) {
  return ScaleT(key, scaleUtc(), channels, options);
}
