import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";

export function Dimensions(
  scales,
  {
    x: {axis: xAxis} = {},
    y: {axis: yAxis} = {},
    fx: {axis: fxAxis} = {},
    fy: {axis: fyAxis} = {}
  },
  {
    width = 640,
    height = autoHeight(scales),
    facet: {
      margin: facetMargin,
      marginTop: facetMarginTop = facetMargin !== undefined ? facetMargin : fxAxis === "top" ? 30 : 0,
      marginRight: facetMarginRight = facetMargin !== undefined ? facetMargin : fyAxis === "right" ? 40 : 0,
      marginBottom: facetMarginBottom = facetMargin !== undefined ? facetMargin : fxAxis === "bottom" ? 30 : 0,
      marginLeft: facetMarginLeft = facetMargin !== undefined ? facetMargin : fyAxis === "left" ? 40 : 0
    } = {},
    margin,
    marginTop = margin !== undefined ? margin : Math.max((xAxis === "top" ? 30 : 0) + facetMarginTop, yAxis || fyAxis ? 20 : 0.5 - offset),
    marginRight = margin !== undefined ? margin : Math.max((yAxis === "right" ? 40 : 0) + facetMarginRight, xAxis || fxAxis ? 20 : 0.5 + offset),
    marginBottom = margin !== undefined ? margin : Math.max((xAxis === "bottom" ? 30 : 0) + facetMarginBottom, yAxis || fyAxis ? 20 : 0.5 + offset),
    marginLeft = margin !== undefined ? margin : Math.max((yAxis === "left" ? 40 : 0) + facetMarginLeft, xAxis || fxAxis ? 20 : 0.5 - offset)
  } = {}
) {
  return {
    width,
    height,
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

function autoHeight({y, fy, fx}) {
  const nfy = fy ? fy.scale.domain().length : 1;
  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : 1;
  return !!(y || fy) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}
