import {create} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Dimensions} from "./dimensions.js";
import {facets} from "./facet.js";
import {Legends, exposeLegends} from "./legends.js";
import {markify} from "./mark.js";
import {Scales, ScaleFunctions, autoScaleRange, applyScales, exposeScales} from "./scales.js";
import {applyInlineStyles, filterStyles, maybeClassName} from "./style.js";

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
      .call(applyInlineStyles, style)
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
  const legends = Legends(scaleDescriptors, options);
  if (caption != null || legends.length > 0) {
    figure = document.createElement("figure");
    figure.style.maxWidth = "initial";
    figure.append(...legends, svg);
    if (caption != null) {
      const figcaption = document.createElement("figcaption");
      figcaption.append(caption);
      figure.append(figcaption);
    }
  }

  figure.scale = exposeScales(scaleDescriptors);
  figure.legend = exposeLegends(scaleDescriptors, options);
  return figure;
}
