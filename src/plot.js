import {create} from "d3-selection";
import {Axes, autoAxisTicks, autoAxisLabels} from "./axes.js";
import {Scales, autoScaleRange} from "./scales.js";

export function plot(options = {}) {
  const {marks = []} = options;

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

  const scaleDescriptors = Scales(scaleChannels, options.scales);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options.axes);
  const dimensions = Dimensions(scaleDescriptors, axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoAxisTicks(axes, dimensions);
  autoAxisLabels(scaleChannels, scaleDescriptors, axes, dimensions);

  if (axes.y) marks.unshift(axes.y);
  if (axes.x) marks.unshift(axes.x);

  const plotOptions = {scales: scaleDescriptors, axes, ...dimensions};
  const {width, height} = dimensions;

  const svg = create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("fill", "currentColor")
      .attr("stroke-miterlimit", 1)
      .style("max-width", `${width}px`)
      .style("display", "block")
      .style("background", "white");

  for (const mark of marks) {
    const channels = markChannels.get(mark);
    const index = markIndex.get(mark);
    const node = mark.render(index, scales, channels, plotOptions);
    if (node != null) svg.append(() => node);
  }

  return svg.node();
}

function Dimensions({y}, {x: xAxis, y: yAxis}, {
  width = 640,
  height = y ? 396 : 60,
  marginTop = !yAxis ? 0 : xAxis && xAxis.anchor === "top" ? 30 : 20,
  marginRight = yAxis && yAxis.anchor === "right" ? 40 : 20,
  marginBottom = xAxis && xAxis.anchor === "bottom" ? 30 : 20,
  marginLeft = yAxis && yAxis.anchor === "left" ? 40 : 20
} = {}) {
  return {width, height, marginTop, marginRight, marginBottom, marginLeft};
}

function ScaleFunctions(scales) {
  return Object.fromEntries(Object.entries(scales).map(([name, {scale}]) => [name, scale]));
}
