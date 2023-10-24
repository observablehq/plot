import {extent, max} from "d3";
import {projectionAspectRatio} from "./projection.js";
import {isOrdinalScale} from "./scales.js";
import {offset} from "./style.js";
import {defaultWidth, monospaceWidth} from "./marks/text.js";
import {outerDimensions} from "./scales.js";
import {formatAxisLabel} from "./marks/axis.js";

const marginMedium = 60;
const marginLarge = 90;

// When axes have "auto" margins, we might need to adjust the margins, after
// seeing the actual tick labels. In that case we’ll compute the dimensions and
// scales a second time.
export function autoMarginK(
  margin,
  {scale, labelAnchor, label},
  options,
  mark,
  stateByMark,
  scales,
  dimensions,
  context
) {
  const actualLabel = formatAxisLabel(scale, scales[scale], {...options, label});
  let {data, facets, channels} = stateByMark.get(mark);
  if (mark.initializer) ({channels} = mark.initializer(data, facets, {}, scales, dimensions, context));
  if (scale === "y" || scale === "fy") {
    const width = mark.monospace ? monospaceWidth : defaultWidth;
    const labelPenalty = actualLabel && (labelAnchor === "center" || (labelAnchor == null && scales[scale].bandwidth));
    const l = max(channels.text.value, (t) => (t ? width(`${t}`) : NaN)) + (labelPenalty ? 100 : 0);
    const m = l >= 500 ? marginLarge : l >= 295 ? marginMedium : null;
    return m === null
      ? options
      : scale === "fy"
      ? {...options, facet: {[margin]: m, ...options.facet}}
      : {[margin]: m, ...options};
  }
  // For the x scale, we bump the margin only if the axis uses multi-line ticks!
  const re = new RegExp(/\n/);
  const m = actualLabel && channels.text.value.some((d) => re.test(d)) ? 40 : null;
  return m === null
    ? options
    : scale === "fx"
    ? {...options, facet: {[margin]: m, ...options.facet}}
    : {[margin]: m, ...options};
}

export function createDimensions(scales, marks, options = {}) {
  // Compute the default margins: the maximum of the marks’ margins. While not
  // always used, they may be needed to compute the default height of the plot.
  let marginTopDefault = 0.5 - offset,
    marginRightDefault = 0.5 + offset,
    marginBottomDefault = 0.5 + offset,
    marginLeftDefault = 0.5 - offset;

  // The left and right margins default to a value inferred from the y (and fy)
  // scales, if present. Axis tick marks specify a minimum value for the margin,
  // that might be auto when it needs to be set from the actual tick labels. In
  // that case, we will compute the chart dimensions as if we used the default
  // small margin, compute all the tick labels and check their lengths, then
  // revise the dimensions if necessary.
  const autoMargins = [];
  for (const m of marks) {
    let {
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      autoMarginTop,
      autoMarginRight,
      autoMarginBottom,
      autoMarginLeft,
      frameAnchor
    } = m;
    if (autoMarginTop) autoMargins.push(["marginTop", autoMarginTop, m]);
    if (autoMarginRight && frameAnchor === "right") autoMargins.push(["marginRight", autoMarginRight, m]);
    if (autoMarginBottom) autoMargins.push(["marginBottom", autoMarginBottom, m]);
    if (autoMarginLeft && frameAnchor === "left") autoMargins.push(["marginLeft", autoMarginLeft, m]);
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
      marginRight,
      marginBottomDefault,
      marginLeft
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

  return {dimensions, autoMargins};
}

function autoHeight(
  {x, y, fy, fx},
  {projection, aspectRatio},
  {width, marginTopDefault, marginRight, marginBottomDefault, marginLeft}
) {
  const nfy = fy ? fy.scale.domain().length : 1;

  // If a projection is specified, use its natural aspect ratio (if known).
  const ar = projectionAspectRatio(projection);
  if (ar) {
    const nfx = fx ? fx.scale.domain().length : 1;
    const far = ((1.1 * nfy - 0.1) / (1.1 * nfx - 0.1)) * ar; // 0.1 is default facet padding
    const lar = Math.max(0.1, Math.min(10, far)); // clamp the aspect ratio to a “reasonable” value
    return Math.round((width - marginLeft - marginRight) * lar + marginTopDefault + marginBottomDefault);
  }

  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : 1;

  // If a desired aspect ratio is given, compute a default height to match.
  if (aspectRatio != null) {
    aspectRatio = +aspectRatio;
    if (!(isFinite(aspectRatio) && aspectRatio > 0)) throw new Error(`invalid aspectRatio: ${aspectRatio}`);
    const ratio = aspectRatioLength("y", y) / (aspectRatioLength("x", x) * aspectRatio);
    const fxb = fx ? fx.scale.bandwidth() : 1;
    const fyb = fy ? fy.scale.bandwidth() : 1;
    const w = fxb * (width - marginLeft - marginRight) - x.insetLeft - x.insetRight;
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

// This differs from the other outerDimensions in that it accounts for rounding
// and outer padding in the facet scales; we want the frame to align exactly
// with the actual range, not the desired range.
export function actualDimensions({fx, fy}, dimensions) {
  const {marginTop, marginRight, marginBottom, marginLeft, width, height} = outerDimensions(dimensions);
  const fxr = fx && outerRange(fx);
  const fyr = fy && outerRange(fy);
  return {
    marginTop: fy ? fyr[0] : marginTop,
    marginRight: fx ? width - fxr[1] : marginRight,
    marginBottom: fy ? height - fyr[1] : marginBottom,
    marginLeft: fx ? fxr[0] : marginLeft,
    // Some marks, namely the x- and y-axis labels, want to know what the
    // desired (rather than actual) margins are for positioning.
    inset: {
      marginTop: dimensions.marginTop,
      marginRight: dimensions.marginRight,
      marginBottom: dimensions.marginBottom,
      marginLeft: dimensions.marginLeft
    },
    width,
    height
  };
}

function outerRange(scale) {
  const domain = scale.domain;
  let x1 = scale.scale(domain[0]);
  let x2 = scale.scale(domain[domain.length - 1]);
  if (x2 < x1) [x1, x2] = [x2, x1];
  return [x1, x2 + scale.scale.bandwidth()];
}
