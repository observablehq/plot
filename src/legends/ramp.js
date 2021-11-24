import {Scale} from "../scales.js";
import {create, scaleLinear, quantize, interpolate, interpolateRound, quantile, range, format, scaleBand, axisBottom} from "d3";
import {applyInlineStyles} from "../style.js";

export function legendRamp(scale, {
  label,
  tickSize = 6,
  width = 240,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  style,
  ticks = width / 64,
  tickFormat,
  tickValues
}) {
  let {type, apply, domain, pivot, range: scaleRange} = scale;
  if (pivot !== undefined) domain = [domain[0], pivot, domain[1]]; // diverging scales
  const color = Scale("color", undefined, scale).scale;
  const svg = create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .call(applyInlineStyles, style);

  if (svg.style("overflow") === "") svg.style("overflow", "visible");
  if (svg.style("display") === "") svg.style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(domain.length, scaleRange.length);
    x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n));
    let color2 = color.copy().domain(quantize(interpolate(0, 1), n));
    // special case for log scales
    if (type === "log") {
      const p = scaleLinear(
        quantize(interpolate(0, 1), domain.length),
        domain.map(d => Math.log(d))
      );
      color2 = t => apply(Math.exp(p(t)));
    }
    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color2).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = range(n).map(i => quantile(domain, i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (type === "threshold" || type === "quantile") {
    const thresholds = domain;
    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? format(tickFormat)
        : tickFormat;

    x = scaleLinear()
        .domain([-1, scaleRange.length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(scaleRange)
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = scaleBand()
        .domain(domain)
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(domain)
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", apply);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(label === undefined ? () => {}
      : g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "label")
        .text(label));

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
