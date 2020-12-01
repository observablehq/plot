import {create} from "d3-selection";
import {Axes, autoAxisTicks, autoAxisLabels} from "./axes.js";
import {Scales, autoScaleRange} from "./scales.js";

export function plot(options = {}) {
  const {
    marks = [],
    font = "10px sans-serif",
    background = "white"
  } = options;

  // A Map from Mark instance to an object of named channel values.
  const markChannels = new Map();
  const markIndex = new Map();

  // A Map from scale name to an array of associated channels.
  const scaleChannels = new Map();

  // Initialize the marks’ channels, indexing them by mark and scale as needed.
  for (const mark of marks) {
    if (markChannels.has(mark)) throw new Error("duplicate mark");
    const named = Object.create(null);
    const {index, channels} = mark.initialize(mark.data);
    for (const [name, channel] of channels) {
      if (name !== undefined) {
        named[name] = channel.value;
      }
      if (channel.scale !== undefined) {
        const scaled = scaleChannels.get(channel.scale);
        if (scaled) scaled.push(channel);
        else scaleChannels.set(channel.scale, [channel]);
      }
    }
    markChannels.set(mark, named);
    markIndex.set(mark, index);
  }

  const scaleDescriptors = Scales(scaleChannels, options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoAxisTicks(axes, dimensions);
  autoAxisLabels(scaleChannels, scaleDescriptors, axes, dimensions);

  // Normalize the options.
  options = {...scaleDescriptors, ...dimensions};
  if (axes.y) options.y = {...options.y, ...axes.y}, marks.unshift(axes.y);
  if (axes.x) options.x = {...options.x, ...axes.x}, marks.unshift(axes.x);

  const {width, height} = dimensions;

  const svg = create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "plot")
      .attr("fill", "currentColor")
      .attr("stroke-miterlimit", 1)
      .attr("text-anchor", "middle")
      .style("font", font)
      .style("max-width", `${width}px`)
      .style("display", "block")
      .style("background", background);

  svg.append("style")
      .text(`.plot text { fill: currentColor; white-space: pre; }`);

  for (const mark of marks) {
    const channels = markChannels.get(mark);
    const index = markIndex.get(mark);
    const node = mark.render(index, scales, channels, options);
    if (node != null) svg.append(() => node);
  }

  return svg.node();
}

function Dimensions({y}, {x: xAxis, y: yAxis}, {
  width = 640,
  height = y ? 396 : 60,
  marginTop = !yAxis ? 0 : xAxis && xAxis.axis === "top" ? 30 : 20,
  marginRight = yAxis && yAxis.axis === "right" ? 40 : 20,
  marginBottom = xAxis && xAxis.axis === "bottom" ? 30 : 20,
  marginLeft = yAxis && yAxis.axis === "left" ? 40 : 20
} = {}) {
  return {width, height, marginTop, marginRight, marginBottom, marginLeft};
}

function ScaleFunctions(scales) {
  return Object.fromEntries(Object.entries(scales).map(([name, {scale}]) => [name, scale]));
}
