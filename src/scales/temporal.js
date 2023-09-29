import {scaleTime, scaleUtc} from "d3";
import {createScaleQ} from "./quantitative.js";

function createScaleT(key, scale, channels, options) {
  return createScaleQ(key, scale, channels, options);
}

export function createScaleTime(key, channels, options) {
  return createScaleT(key, scaleTime(), channels, options);
}

export function createScaleUtc(key, channels, options) {
  return createScaleT(key, scaleUtc(), channels, options);
}
