import {isProjection} from "./projection.js";
import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";

export function Dimensions(
  scales,
  geometry,
  {x: {axis: xAxis} = {}, y: {axis: yAxis} = {}, fx: {axis: fxAxis} = {}, fy: {axis: fyAxis} = {}},
  {
    projection,
    width = 640,
    facet: {
      margin: facetMargin,
      marginTop: facetMarginTop = facetMargin !== undefined ? facetMargin : fxAxis === "top" ? 30 : 0,
      marginRight: facetMarginRight = facetMargin !== undefined ? facetMargin : fyAxis === "right" ? 40 : 0,
      marginBottom: facetMarginBottom = facetMargin !== undefined ? facetMargin : fxAxis === "bottom" ? 30 : 0,
      marginLeft: facetMarginLeft = facetMargin !== undefined ? facetMargin : fyAxis === "left" ? 40 : 0
    } = {},
    marginTopAuto = Math.max((xAxis === "top" ? 30 : 0) + facetMarginTop, yAxis || fyAxis ? 20 : 0.5 - offset),
    marginBottomAuto = Math.max((xAxis === "bottom" ? 30 : 0) + facetMarginBottom, yAxis || fyAxis ? 20 : 0.5 + offset),
    margin,
    marginTop = margin !== undefined ? margin : marginTopAuto,
    marginRight = margin !== undefined
      ? margin
      : Math.max((yAxis === "right" ? 40 : 0) + facetMarginRight, xAxis || fxAxis ? 20 : 0.5 + offset),
    marginBottom = margin !== undefined ? margin : marginBottomAuto,
    marginLeft = margin !== undefined
      ? margin
      : Math.max((yAxis === "left" ? 40 : 0) + facetMarginLeft, xAxis || fxAxis ? 20 : 0.5 - offset),
    height = autoHeight(scales, geometry || isProjection(projection)) + Math.max(0, marginTop - marginTopAuto + marginBottom - marginBottomAuto)
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

function autoHeight({y, fy, fx}, geometry, add) {
  const nfy = fy ? fy.scale.domain().length : 1;
  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : geometry ? 17 : 1;
  return !!(y || fy || geometry) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60 + Math.max(0, add);
}
