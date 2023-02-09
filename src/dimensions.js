import {projectionAspectRatio} from "./projection.js";
import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";
import {warn} from "./warnings.js";

export function Dimensions(scales, marks, options = {}) {
  // Compute the default margins: the maximum of the marks’ margins. While not
  // always used, they may be needed to compute the default height of the plot.
  let marginTopDefault = 0.5 - offset,
    marginRightDefault = 0.5 + offset,
    marginBottomDefault = 0.5 + offset,
    marginLeftDefault = 0.5 - offset;

  for (const {marginTop, marginRight, marginBottom, marginLeft} of marks) {
    if (marginTop > marginTopDefault) marginTopDefault = marginTop;
    if (marginRight > marginRightDefault) marginRightDefault = marginRight;
    if (marginBottom > marginBottomDefault) marginBottomDefault = marginBottom;
    if (marginLeft > marginLeftDefault) marginLeftDefault = marginLeft;
  }

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
    height = autoHeight(scales, marks, options, {
      width,
      marginTopDefault,
      marginRightDefault,
      marginBottomDefault,
      marginLeftDefault
    }) + Math.max(0, marginTop - marginTopDefault + marginBottom - marginBottomDefault)
  } = options;

  // Coerce the width and height.
  width = +width;
  height = +height;

  const dimensions = {
    width,
    height,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
  };

  // Compute the facet margins.
  if (scales.fx || scales.fy) {
    let {
      margin: facetMargin,
      marginTop: facetMarginTop = facetMargin !== undefined ? facetMargin : marginTop,
      marginRight: facetMarginRight = facetMargin !== undefined ? facetMargin : marginRight,
      marginBottom: facetMarginBottom = facetMargin !== undefined ? facetMargin : marginBottom,
      marginLeft: facetMarginLeft = facetMargin !== undefined ? facetMargin : marginLeft
    } = options.facet ?? {};

    // Coerce the facet margin options to numbers.
    facetMarginTop = +facetMarginTop;
    facetMarginRight = +facetMarginRight;
    facetMarginBottom = +facetMarginBottom;
    facetMarginLeft = +facetMarginLeft;

    dimensions.facet = {
      marginTop: facetMarginTop,
      marginRight: facetMarginRight,
      marginBottom: facetMarginBottom,
      marginLeft: facetMarginLeft
    };
  }

  return dimensions;
}

function autoHeight(
  {x, y, fy, fx},
  marks,
  {projection, dataAspectRatio},
  {width, marginTopDefault, marginRightDefault, marginBottomDefault, marginLeftDefault}
) {
  const nfy = fy ? fy.scale.domain().length : 1;

  // If a projection is specified, use its natural aspect ratio (if known).
  const ar = projectionAspectRatio(projection, marks);
  if (ar) {
    const nfx = fx ? fx.scale.domain().length : 1;
    const far = ((1.1 * nfy - 0.1) / (1.1 * nfx - 0.1)) * ar; // 0.1 is default facet padding
    const lar = Math.max(0.1, Math.min(10, far)); // clamp the aspect ratio to a “reasonable” value
    return Math.round((width - marginLeftDefault - marginRightDefault) * lar + marginTopDefault + marginBottomDefault);
  }

  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : 1;

  // If a data aspect ratio is given, tweak the height to match
  if ((dataAspectRatio = +dataAspectRatio)) {
    if (!(isFinite(dataAspectRatio) && dataAspectRatio > 0))
      throw new Error(`invalid data aspect ratio: ${dataAspectRatio}`);
    if (!["utc", "time", "linear"].includes(x?.type) || !["utc", "time", "linear"].includes(y?.type)) {
      warn(`invalid x/y scale types for the dataAspectRatio option: ${x?.type}/${y?.type}`);
    } else {
      const ratio = Math.abs((y.domain[1] - y.domain[0]) / (x.domain[1] - x.domain[0]) / dataAspectRatio);
      const trueWidth =
        (fx ? fx.scale.bandwidth() : 1) * (width - marginLeftDefault - marginRightDefault) - x.insetLeft - x.insetRight;
      return (
        (ratio * trueWidth + y.insetTop + y.insetBottom) / (fy ? fy.scale.bandwidth() : 1) +
        marginTopDefault +
        marginBottomDefault
      );
    }
  }

  return !!(y || fy) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}
