import {hasProjection} from "./projection.js";
import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";

export function Dimensions(scales, geometry, axes, options = {}) {
  // The default margins depend on the presence and orientation of axes. If the
  // corresponding scale is not present, the axis is necessarily null.
  const {x: {axis: x} = {}, y: {axis: y} = {}, fx: {axis: fx} = {}, fy: {axis: fy} = {}} = axes;

  // Compute the default facet margins. When faceting is not present (and hence
  // the fx and fy axis are null), these will all be zero.
  let {
    facet: {
      margin: facetMargin,
      marginTop: facetMarginTop = facetMargin !== undefined ? facetMargin : fx === "top" ? 30 : 0,
      marginRight: facetMarginRight = facetMargin !== undefined ? facetMargin : fy === "right" ? 40 : 0,
      marginBottom: facetMarginBottom = facetMargin !== undefined ? facetMargin : fx === "bottom" ? 30 : 0,
      marginLeft: facetMarginLeft = facetMargin !== undefined ? facetMargin : fy === "left" ? 40 : 0
    } = {}
  } = options;

  // Coerce the facet margin options to numbers.
  facetMarginTop = +facetMarginTop;
  facetMarginRight = +facetMarginRight;
  facetMarginBottom = +facetMarginBottom;
  facetMarginLeft = +facetMarginLeft;

  // Compute the default margins; while not always used, they may be needed to
  // compute the default height of the plot.
  const marginTopDefault = Math.max((x === "top" ? 30 : 0) + facetMarginTop, y || fy ? 20 : 0.5 - offset);
  const marginBottomDefault = Math.max((x === "bottom" ? 30 : 0) + facetMarginBottom, y || fy ? 20 : 0.5 + offset);
  const marginRightDefault = Math.max((y === "right" ? 40 : 0) + facetMarginRight, x || fx ? 20 : 0.5 + offset);
  const marginLeftDefault = Math.max((y === "left" ? 40 : 0) + facetMarginLeft, x || fx ? 20 : 0.5 - offset);

  // Compute the actual margins. The order of precedence is: the side-specific
  // margin options, then the global margin option, then the defaults.
  let {
    margin,
    marginTop = margin !== undefined ? margin : marginTopDefault,
    marginRight = margin !== undefined ? margin : marginRightDefault,
    marginBottom = margin !== undefined ? margin : marginBottomDefault,
    marginLeft = margin !== undefined ? margin : marginLeftDefault
  } = options;

  // Coerce the margin options to numbers.
  marginTop = +marginTop;
  marginRight = +marginRight;
  marginBottom = +marginBottom;
  marginLeft = +marginLeft;

  // Compute the outer dimensions of the plot. If the top and bottom margins are
  // specified explicitly, adjust the automatic height accordingly.
  let {
    width = 640,
    height = autoHeight(scales, geometry || hasProjection(options)) +
      Math.max(0, marginTop - marginTopDefault + marginBottom - marginBottomDefault)
  } = options;

  // Coerce the width and height.
  width = +width;
  height = +height;

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

function autoHeight({y, fy, fx}, geometry) {
  const nfy = fy ? fy.scale.domain().length : 1;
  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : geometry ? 17 : 1;
  return !!(y || fy || geometry) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}
