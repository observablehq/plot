import {cross, range} from "d3-array";
import {create} from "d3-selection";
import {Plot} from "./plot.js";
import {auto, band} from "./scale.js";

export function Frame(options = {}) {
  if (options.x !== undefined && !options.x) options = {...options, x: {type: null}};
  if (options.y !== undefined && !options.y) options = {...options, y: {type: null}};
  const [x, xOptions] = auto(options.x);
  const [y, yOptions] = auto(options.y);

  // Faceting
  if (options.fx || options.fy) {
    const [fx, fxOptions] = options.fx ? band(options.fx) : [];
    const [fy, fyOptions] = options.fy ? band(options.fy) : [];

    // Trivial domains when opposite facet axis is missing
    let {
      fx: {domain: fxDomain = [undefined]} = {},
      fy: {domain: fyDomain = [undefined]} = {}
    } = options;
    const n = fxDomain.length;
    const m = fyDomain.length;

    // Facet axis orientation (defaults to opposite inner axis) and labels
    let {
      axes = true, // convenience for xAxis, yAxis
      x: {axis: xAxis = axes} = {}, // true = bottom, top, false
      y: {axis: yAxis = axes} = {}, // true = left, right, false
      fx: {axis: fxAxis = xAxis, label: fxLabel} = {},
      fy: {axis: fyAxis = yAxis, label: fyLabel} = {},
      render
    } = options;
    if (!xAxis) xAxis = null; else if (xAxis === true) xAxis = "bottom";
    if (!yAxis) yAxis = null; else if (yAxis === true) yAxis = "left";
    if (!fx || !fxAxis) fxAxis = null; else if (fxAxis === true) fxAxis = xAxis;
    if (!fy || !fyAxis) fyAxis = null; else if (fyAxis === true) fyAxis = yAxis;

    // Facet margins
    let {
      marginTop = fx ? (fxAxis === "top" || xAxis === "top" ? 30 : 20) : undefined,
      marginRight = fy ? (fyAxis === "right" || yAxis === "right" ? 40 : 20) : undefined,
      marginBottom = fx ? 30 : undefined,
      marginLeft = fy ? (fyAxis === "left" || yAxis === "left" ? 40 : 20) : undefined
    } = options;

    // Facet and label offsets
    let {
      x: {
        labelOffset: xLabelOffset = xAxis === "top" ? marginTop : marginBottom
      } = {},
      y: {
        labelOffset: yLabelOffset = yAxis === "left" ? marginLeft : marginRight
      } = {},
      fx: {
        offset: fxOffset = 0,
        labelOffset: fxLabelOffset = fxAxis === "top" ? marginTop : marginBottom,
        format: fxFormat
      } = {},
      fy: {
        offset: fyOffset = 0,
        labelOffset: fyLabelOffset = fyAxis === "left" ? marginLeft : marginRight,
        format: fyFormat
      } = {},
    } = options;
    if (!fxAxis || fxAxis !== xAxis);
    else if (fxAxis === "top") fxOffset += marginTop, marginTop *= 2;
    else fxOffset += marginBottom, marginBottom *= 2;
    if (!fyAxis || fyAxis !== yAxis);
    else if (fyAxis === "left") fyOffset += marginLeft, marginLeft *= 2;
    else fyOffset += marginRight, marginRight *= 2;

    // Facet padding and alignment
    let {
      fx: {
        align: fxAlign = yAxis === "right" ? 1 : 0,
        padding: fxPadding,
        paddingInner: fxPaddingInner = fxPadding === undefined ? 0.15 : fxPadding
      } = {},
      fy: {
        align: fyAlign = xAxis === "top" ? 0 : 1,
        padding: fyPadding,
        paddingInner: fyPaddingInner = fyPadding === undefined ? 0.15 : fyPadding
      } = {}
    } = options;
    if (fx) fx.paddingInner(fxPaddingInner).align(fxAlign);
    if (fy) fy.paddingInner(fyPaddingInner).align(fyAlign);

    return Plot(fx || x, fy || y, {
      ...options,
      x: {
        ...fx ? fxOptions : xOptions,
        ...options.x,
        ...fx ? {
          axis: fxAxis,
          offset: fxOffset,
          label: fxLabel,
          labelOffset: fxLabelOffset,
          format: fxFormat
        } : {axis: xAxis},
        grid: false
      },
      y: {
        ...fy ? fyOptions : yOptions,
        ...options.y,
        ...fy ? {
          axis: fyAxis,
          offset: fyOffset,
          label: fyLabel,
          labelOffset: fyLabelOffset,
          format: fyFormat
        } : {axis: yAxis},
        grid: false
      },
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      render: (_x, _y, {width, height}) => {
        const suboptions = {
          ...options,
          x: {
            labelAnchor: yAxis === "right" ? "left" : "right",
            ...xOptions,
            ...options.x,
            labelOffset: xLabelOffset
          },
          y: {
            labelAnchor: xAxis === "top" ? "bottom" : "top",
            ...yOptions,
            ...options.y,
            labelOffset: yLabelOffset
          },
          width,
          height
        };
        const xj = xAxis === "top" ? m - 1 : 0;
        const yi = yAxis === "right" ? n - 1 : 0;
        const xi = suboptions.x.labelAnchor === "center" ? n >> 1 : yAxis === "right" ? 0 : n - 1;
        const yj = suboptions.y.labelAnchor === "center" ? m >> 1 : xAxis === "top" ? 0 : m - 1;
        return create("svg:g")
          .call(g => g.selectAll()
            .data(cross(range(n), range(m)))
            .enter().append(([i, j]) => Plot(x, y, {
              ...suboptions,
              x: {
                ...suboptions.x,
                axis: fx && j === xj ? xAxis : false,
                ...(j !== xj || i !== xi) && {label: null}
              },
              y: {
                ...suboptions.y,
                axis: fy && i === yi ? yAxis : false,
                ...(i !== yi || j !== yj) && {label: null}
              },
              marginTop: fy ? fy(fyDomain[j]) : marginTop,
              marginRight: fx ? width - fx(fxDomain[i]) - fx.bandwidth() : marginRight,
              marginBottom: fy ? height - fy(fyDomain[j]) - fy.bandwidth() : marginBottom,
              marginLeft: fx ? fx(fxDomain[i]) : marginLeft,
              render: render && ((_x, _y, d) => render(x, y, d, fx && fxDomain[i], fy && fyDomain[j]))
            }))
              .attr("style", null)
              .attr("viewBox", null))
          .node();
      }
    });
  }

  return Plot(x, y, {
    ...options,
    x: {...xOptions, ...options.x},
    y: {...yOptions, ...options.y}
  });
}
