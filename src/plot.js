import {group} from "d3-array";
import {create} from "d3-selection";
import {Axes, autoAxisTicks, autoAxisLabels} from "./axes.js";
import {indexOf} from "./mark.js";
import {Scales, autoScaleRange} from "./scales.js";

export function plot(options = {}) {
  const {marks = []} = options;
  const channels = ScaleChannels(marks);
  const scales = Scales(channels, options.scales);
  const axes = Axes(scales, options.axes);
  const dimensions = Dimensions(scales, axes, options);

  autoScaleRange(scales, dimensions);
  autoAxisTicks(axes, dimensions);
  autoAxisLabels(channels, scales, axes, dimensions);

  if (axes.y) marks.unshift(axes.y);
  if (axes.x) marks.unshift(axes.x);

  const {width, height} = dimensions;

  const svg = create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", `${width}px`)
      .style("display", "block");

  for (const mark of marks) {
    const index = mark.data === undefined ? undefined : Array.from(mark.data, indexOf);
    const node = mark.render(index, scales, dimensions);
    if (node != null) svg.append(() => node);
  }

  return svg.node();
}

export function Dimensions({y}, {x: xAxis, y: yAxis}, {
  width = 640,
  height = y ? 396 : 60,
  marginTop = !yAxis ? 0 : xAxis && xAxis.anchor === "top" ? 30 : 20,
  marginRight = yAxis && yAxis.anchor === "right" ? 40 : 20,
  marginBottom = xAxis && xAxis.anchor === "bottom" ? 30 : 20,
  marginLeft = yAxis && yAxis.anchor === "left" ? 40 : 20
} = {}) {
  return {width, height, marginTop, marginRight, marginBottom, marginLeft};
}

export function ScaleChannels(marks) {
  return group(marks.flatMap(m => m.scaleChannels), ({scale}) => scale);
}
