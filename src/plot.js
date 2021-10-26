import {create} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {facets} from "./facet.js";
import {markify} from "./mark.js";
import {Scales, autoScaleRange, applyScales, exposeScales, isOrdinalScale} from "./scales.js";
import {filterStyles, maybeClassName, offset} from "./style.js";

export function plot(options = {}) {
  const {facet, style, caption} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // When faceting, wrap all marks in a faceting mark.
  if (facet !== undefined) {
    const {marks} = options;
    const {data} = facet;
    options = {...options, marks: facets(data, facet, marks)};
  }

  // Flatten any nested marks.
  const marks = options.marks === undefined ? [] : options.marks.flat(Infinity).map(markify);

  // A Map from Mark instance to an object of named channel values.
  const markChannels = new Map();
  const markIndex = new Map();

  // A Map from scale name to an array of associated channels.
  const scaleChannels = new Map();

  // Initialize the marks’ channels, indexing them by mark and scale as needed.
  // Also apply any scale transforms.
  for (const mark of marks) {
    if (markChannels.has(mark)) throw new Error("duplicate mark");
    const {index, channels} = mark.initialize();
    for (const [, channel] of channels) {
      const {scale} = channel;
      if (scale !== undefined) {
        const scaled = scaleChannels.get(scale);
        const {percent, transform = percent ? x => x * 100 : undefined} = options[scale] || {};
        if (transform != null) channel.value = Array.from(channel.value, transform);
        if (scaled) scaled.push(channel);
        else scaleChannels.set(scale, [channel]);
      }
    }
    markChannels.set(mark, channels);
    markIndex.set(mark, index);
  }

  const scaleDescriptors = Scales(scaleChannels, options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoScaleLabels(scaleChannels, scaleDescriptors, axes, dimensions, options);
  autoAxisTicks(scaleDescriptors, axes);

  // Normalize the options.
  options = {...scaleDescriptors, ...dimensions};
  if (axes.x) options.x = {...options.x, ...axes.x};
  if (axes.y) options.y = {...options.y, ...axes.y};
  if (axes.fx) options.fx = {...options.fx, ...axes.fx};
  if (axes.fy) options.fy = {...options.fy, ...axes.fy};

  // When faceting, render axes for fx and fy instead of x and y.
  const x = facet !== undefined && scales.fx ? "fx" : "x";
  const y = facet !== undefined && scales.fy ? "fy" : "y";
  if (axes[x]) marks.unshift(axes[x]);
  if (axes[y]) marks.unshift(axes[y]);

  const {width, height} = dimensions;

  const svg = create("svg")
      .attr("class", className)
      .attr("fill", "currentColor")
      .attr("font-family", "system-ui, sans-serif")
      .attr("font-size", 10)
      .attr("font-variant", "tabular-nums")
      .attr("text-anchor", "middle")
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
        }
        .${className} text {
          white-space: pre;
        }
      `))
      .each(function() {
        if (typeof style === "string") this.style = style;
        else Object.assign(this.style, style);
      })
    .node();

  for (const mark of marks) {
    const channels = markChannels.get(mark);
    const values = applyScales(channels, scales);
    const index = filterStyles(markIndex.get(mark), values);
    const node = mark.render(index, scales, values, dimensions, axes);
    if (node != null) svg.appendChild(node);
  }

  // Wrap the plot in a figure with a caption, if desired.
  let figure = svg;
  if (caption != null) {
    figure = document.createElement("figure");
    figure.appendChild(svg);
    const figcaption = figure.appendChild(document.createElement("figcaption"));
    figcaption.appendChild(caption instanceof Node ? caption : document.createTextNode(caption));
  }

  figure.scale = exposeScales(scaleDescriptors);
  return figure;
}

function Dimensions(
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
      marginTop: facetMarginTop = fxAxis === "top" ? 30 : 0,
      marginRight: facetMarginRight = fyAxis === "right" ? 40 : 0,
      marginBottom: facetMarginBottom = fxAxis === "bottom" ? 30 : 0,
      marginLeft: facetMarginLeft = fyAxis === "left" ? 40 : 0
    } = {},
    marginTop = Math.max((xAxis === "top" ? 30 : 0) + facetMarginTop, yAxis || fyAxis ? 20 : 0.5 - offset),
    marginRight = Math.max((yAxis === "right" ? 40 : 0) + facetMarginRight, xAxis || fxAxis ? 20 : 0.5 + offset),
    marginBottom = Math.max((xAxis === "bottom" ? 30 : 0) + facetMarginBottom, yAxis || fyAxis ? 20 : 0.5 + offset),
    marginLeft = Math.max((yAxis === "left" ? 40 : 0) + facetMarginLeft, xAxis || fxAxis ? 20 : 0.5 - offset)
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

function ScaleFunctions(scales) {
  return Object.fromEntries(Object.entries(scales).map(([name, {scale}]) => [name, scale]));
}

function autoHeight({y, fy, fx}) {
  const nfy = fy ? fy.scale.domain().length : 1;
  const ny = y ? (isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy)) : 1;
  return !!(y || fy) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}
