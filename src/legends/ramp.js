import {create, quantize, interpolateNumber, piecewise, format, scaleBand, scaleLinear, axisBottom} from "d3";
import {inferFontVariant} from "../axes.js";
import {map} from "../options.js";
import {interpolatePiecewise} from "../scales/quantitative.js";
import {applyInlineStyles, impliedString, maybeClassName} from "../style.js";

export function legendRamp(color, {
  label = color.label,
  tickSize = 6,
  width = 240,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  style,
  ticks = (width - marginLeft - marginRight) / 64,
  tickFormat,
  fontVariant = inferFontVariant(color),
  round = true,
  className
}) {
  className = maybeClassName(className);
  if (tickFormat === null) tickFormat = () => null;

  const svg = create("svg")
      .attr("class", className)
      .attr("font-family", "system-ui, sans-serif")
      .attr("font-size", 10)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .call(svg => svg.append("style").text(`
        .${className} {
          display: block;
          background: white;
          height: auto;
          height: intrinsic;
          max-width: 100%;
          overflow: visible;
        }
        .${className} text {
          white-space: pre;
        }
      `))
      .call(applyInlineStyles, style);

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);

  let x;

  // Some D3 scales use scale.interpolate, some scale.interpolator, and some
  // scale.round; this normalizes the API so it works with all scale types.
  const applyRange = round
      ? (x, range) => x.rangeRound(range)
      : (x, range) => x.range(range);

  const {type, domain, range, interpolate, scale, pivot} = color;

  // Continuous
  if (interpolate) {

    // Often interpolate is a “fixed” interpolator on the [0, 1] interval, as
    // with a built-in color scheme, but sometimes it is a function that takes
    // two arguments and is used in conjunction with the range.
    const interpolator = range === undefined ? interpolate
        : piecewise(interpolate.length === 1 ? interpolatePiecewise(interpolate)
        : interpolate, range);

    // Construct a D3 scale of the same type, but with a range that evenly
    // divides the horizontal extent of the legend. (In the common case, the
    // domain.length is two, and so the range is simply the extent.) For a
    // diverging scale, we need an extra point in the range for the pivot such
    // that the pivot is always drawn in the middle.
    x = applyRange(
      scale.copy(),
      quantize(
        interpolateNumber(marginLeft, width - marginRight),
        Math.min(
          domain.length + (pivot !== undefined),
          range === undefined ? Infinity : range.length
        )
      )
    );

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(interpolator).toDataURL());
  }

  // Threshold
  else if (type === "threshold") {
    const thresholds = domain;

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? format(tickFormat)
        : tickFormat;

    // Construct a linear scale with evenly-spaced ticks for each of the
    // thresholds; the domain extends one beyond the threshold extent.
    x = applyRange(scaleLinear().domain([-1, range.length - 1]), [marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll()
      .data(range)
      .enter()
      .append("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    ticks = map(thresholds, (_, i) => i);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal (hopefully!)
  else {
    x = applyRange(scaleBand().domain(domain), [marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll()
      .data(domain)
      .enter()
      .append("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", scale);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(axisBottom(x)
          .ticks(Array.isArray(ticks) ? null : ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(Array.isArray(ticks) ? ticks : null))
      .attr("font-size", null)
      .attr("font-family", null)
      .attr("font-variant", impliedString(fontVariant, "normal"))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove());

  if (label !== undefined) {
    svg.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop - 6)
        .attr("fill", "currentColor") // TODO move to stylesheet?
        .attr("font-weight", "bold")
        .text(label);
  }

  return svg.node();
}

function ramp(color, n = 256) {
  const canvas = create("canvas").attr("width", n).attr("height", 1).node();
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}
