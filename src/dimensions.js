import {max, extent} from "d3";
import {projectionAspectRatio} from "./projection.js";
import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";
import {defaultWidth} from "./marks/text.js";

// A heuristic to determine the default margin. Ordinal scales usually reclaim
// more space. We can also gauge the “type of contents” (domain, ticks) and
// decide whether it’s small, medium or large. When the labelAnchor is
// explicitly set to "center", we need more space too. We don’t want the result
// to match the contents exactly because it shouldn’t wobble when the scale
// changes a little.
function autoMarginH([scale = {}, options]) {
  const marginS = 40;
  const marginM = 60;
  const marginL = 90;
  const {type, ticks, domain} = scale;
  if (!type) return marginS;
  const l =
    (max(ticks ?? domain ?? [], (d) =>
      typeof d === "string"
        ? defaultWidth(d)
        : typeof d === "number"
        ? 60 * Math.ceil(Math.abs(Math.log10(Math.abs(d || 2))))
        : d instanceof Date
        ? 200
        : 60
    ) || 0) +
    2 * (type === "point" || type === "band" || options?.labelAnchor === "center");
  return l >= 400 ? marginL : l > 240 ? marginM : marginS;
}

export function createDimensions(scales, marks, options = {}) {
  // Compute the default margins: the maximum of the marks’ margins. While not
  // always used, they may be needed to compute the default height of the plot.
  let marginTopDefault = 0.5 - offset,
    marginRightDefault = 0.5 + offset,
    marginBottomDefault = 0.5 + offset,
    marginLeftDefault = 0.5 - offset;

  // The left and right margins default to a value inferred from the y (and fy)
  // scales, if present.
  const yflip = options.y?.axis === "right" || options.fy?.axis === "left";
  for (let {marginTop, marginRight, marginBottom, marginLeft} of marks) {
    if (marginLeft === "auto") marginLeft = autoMarginH(yflip ? [scales.fy, options.fy] : [scales.y, options.y]);
    if (marginRight === "auto") marginRight = autoMarginH(yflip ? [scales.y, options.y] : [scales.fy, options.fy]);
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
    height = autoHeight(scales, options, {
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
  {projection, aspectRatio},
  {width, marginTopDefault, marginRightDefault, marginBottomDefault, marginLeftDefault}
) {
  const nfy = fy ? fy.scale.domain().length || 1 : 1;

  // If a projection is specified, compute an aspect ratio based on the domain,
  // defaulting to the projection’s natural aspect ratio (if known).
  const ar = projectionAspectRatio(projection);
  if (ar) {
    const nfx = fx ? fx.scale.domain().length : 1;
    const far = ((1.1 * nfy - 0.1) / (1.1 * nfx - 0.1)) * ar; // 0.1 is default facet padding
    const lar = Math.max(0.1, Math.min(10, far)); // clamp the aspect ratio to a “reasonable” value
    return Math.round((width - marginLeftDefault - marginRightDefault) * lar + marginTopDefault + marginBottomDefault);
  }
  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length || 1 : Math.max(7, 17 / nfy)) : 1;

  // If a desired aspect ratio is given, compute a default height to match.
  if (aspectRatio != null) {
    aspectRatio = +aspectRatio;
    if (!(isFinite(aspectRatio) && aspectRatio > 0)) throw new Error(`invalid aspectRatio: ${aspectRatio}`);
    const ratio = aspectRatioLength("y", y) / (aspectRatioLength("x", x) * aspectRatio);
    const fxb = fx ? fx.scale.bandwidth() : 1;
    const fyb = fy ? fy.scale.bandwidth() : 1;
    const w = fxb * (width - marginLeftDefault - marginRightDefault) - x.insetLeft - x.insetRight;
    return (ratio * w + y.insetTop + y.insetBottom) / fyb + marginTopDefault + marginBottomDefault;
  }

  return !!(y || fy) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}

function aspectRatioLength(k, scale) {
  if (!scale) throw new Error(`aspectRatio requires ${k} scale`);
  const {type, domain} = scale;
  let transform;
  switch (type) {
    case "linear":
    case "utc":
    case "time":
      transform = Number;
      break;
    case "pow": {
      const exponent = scale.scale.exponent();
      transform = (x) => Math.pow(x, exponent);
      break;
    }
    case "log":
      transform = Math.log;
      break;
    case "point":
    case "band":
      return domain.length;
    default:
      throw new Error(`unsupported ${k} scale for aspectRatio: ${type}`);
  }
  const [min, max] = extent(domain);
  return Math.abs(transform(max) - transform(min));
}
