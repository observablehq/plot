import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";

export function Dimensions(
  scales,
  {x: {axis: xAxis} = {}, y: {axis: yAxis} = {}, fx: {axis: fxAxis} = {}, fy: {axis: fyAxis} = {}},
  {
    width = 640,
    daspect,
    height,
    facet: {
      margin: facetMargin,
      marginTop: facetMarginTop = facetMargin !== undefined ? facetMargin : fxAxis === "top" ? 30 : 0,
      marginRight: facetMarginRight = facetMargin !== undefined ? facetMargin : fyAxis === "right" ? 40 : 0,
      marginBottom: facetMarginBottom = facetMargin !== undefined ? facetMargin : fxAxis === "bottom" ? 30 : 0,
      marginLeft: facetMarginLeft = facetMargin !== undefined ? facetMargin : fyAxis === "left" ? 40 : 0
    } = {},
    margin,
    marginTop = margin !== undefined
      ? margin
      : Math.max((xAxis === "top" ? 30 : 0) + facetMarginTop, yAxis || fyAxis ? 20 : 0.5 - offset),
    marginRight = margin !== undefined
      ? margin
      : Math.max((yAxis === "right" ? 40 : 0) + facetMarginRight, xAxis || fxAxis ? 20 : 0.5 + offset),
    marginBottom = margin !== undefined
      ? margin
      : Math.max((xAxis === "bottom" ? 30 : 0) + facetMarginBottom, yAxis || fyAxis ? 20 : 0.5 + offset),
    marginLeft = margin !== undefined
      ? margin
      : Math.max((yAxis === "left" ? 40 : 0) + facetMarginLeft, xAxis || fxAxis ? 20 : 0.5 - offset)
  } = {}
) {
  return {
    width,
    height: height !== undefined ? height : autoHeight(scales, {width, marginLeft, marginRight, marginTop, marginBottom}, daspect),
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    facetMarginTop,
    facetMarginRight,
    facetMarginBottom,
    facetMarginLeft
  };
}

function autoHeight({x, y, fy, fx}, {width, marginLeft, marginRight, marginTop, marginBottom}, daspect) {
  const nfy = fy ? fy.scale.domain().length : 1;
  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : 1;

  // If a data aspect ratio is given, tweak the height to match
  if (daspect != null && daspect !== false) {
    if (!(isFinite(daspect) && daspect > 0)) throw new Error(`invalid data aspect ratio: ${daspect}`);
    const ratio = Math.abs((y.domain[1] - y.domain[0]) / (x.domain[1] - x.domain[0]) / daspect);
    const trueWidth = (fx ? fx.scale.bandwidth() : 1) * (width - marginLeft - marginRight);
    return (ratio * trueWidth) / (fy ? fy.scale.bandwidth() : 1) + marginTop + marginBottom;
  }

  return !!(y || fy) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}
