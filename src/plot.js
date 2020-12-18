import {create} from "d3-selection";
import {Axes, autoAxisTicks, autoAxisLabels} from "./axes.js";
import {facets} from "./marks/facet.js";
import {Scales, autoScaleRange} from "./scales.js";

export function plot(options = {}) {
  const {facet} = options;

  // When faceting, wrap all marks in a faceting mark.
  if (facet !== undefined) {
    const {marks} = options;
    const {data} = facet;
    options = {...options, marks: facets(data, facet, marks)}; //overwrites options param with one that wraps all marks in a facet mark
  }

  const {
    marks = [],
    display = "block",
    font = "10px sans-serif",
    background = "white"
  } = options;

  // A Map from Mark instance to an object of named channel values.
  const markChannels = new Map(); // map from mark to normalized values like {x1: [23, 34, 92…]}
  const markIndex = new Map(); // just a map from the mark to an array of indices like [0, 1, 2, 3...]

  // A Map from scale name to an array of associated channels.
  const scaleChannels = new Map();

  // Initialize the marks’ channels, indexing them by mark and scale as needed.
  for (const mark of marks) {
    if (markChannels.has(mark)) throw new Error("duplicate mark");
    // this obj will be the value of the map from mark instances to an obj of channels -> their values
    const named = Object.create(null);
    // Apply accessor to channels so they have arrays of plain values ready to be scaled
    const {index, channels} = mark.initialize(mark.data);
    for (const [name, channel] of channels) {
      // Name is set by the mark; marks can use whatever names they wnat… I tihnk? used as key in markChannels
      // when would name be undefined?
      if (name !== undefined) {
        named[name] = channel.value;
      }
      // when would channel scale be undefined?
      if (channel.scale !== undefined) {
        const scaled = scaleChannels.get(channel.scale);
        // but nothing's ever done with `scaled`? oh i see it mutates the array
        // in-place in the scaleChannels Map…
        if (scaled) scaled.push(channel);
        else scaleChannels.set(channel.scale, [channel]);
      }
    }
    markChannels.set(mark, named);
    markIndex.set(mark, index);
  }

  const scaleDescriptors = Scales(scaleChannels, options); // objects describing configuration of scales, and the fns themselves
  const scales = ScaleFunctions(scaleDescriptors); // shortcut from descriptors to the d3 scales themselves, the functions you call like the `x` in `x(d.date)`
  const axes = Axes(scaleDescriptors, options); // objects describing configuration of axes
  const dimensions = Dimensions(scaleDescriptors, axes, options); // object of height/width/margin values in pixels

  // When faceting, layout fx and fy instead of x and y.
  // TODO cleaner
  if (facet !== undefined) {
    const x = scales.fx ? "fx" : "x"; // at least one of these (scales.fx or scales.fy)
    const y = scales.fy ? "fy" : "y"; // will be truthy, since facet !== undefined. right?
    const facetScaleChannels = new Map([["x", scaleChannels.get(x)], ["y", scaleChannels.get(y)]]);
    const facetScaleDescriptors = {x: scaleDescriptors[x], y: scaleDescriptors[y]}; // whats the dif b/w this and scaleDescriptors? 
    const facetAxes = {x: axes[x], y: axes[y]};
    // ?? gotta understand … facets are just cartesian positional band scales.
    // in the faceted dimension, this overrides the thing ordinarily called "x"
    // or "y" with that outer scale. this keeps names of x and y scales
    // invariant under the operation of wrapping in a facet, so it's easy to
    // facet or unfacet by just changing one thing in one place, rather than
    // having to manually rectify the names of the inner scales. (the axes are
    // named from the inside out, even though the chart is rendered from the
    // outside in.) so plot.js only handles the scaling of the OUTER scales? and
    // then facet.js handles the autosizing of the interior? does facet.js have
    // to make and manage its own scales?? no, doesn't look like it. so how do
    // the inner dimensions get autoScaled to the right subdimensions?? oh — ok,
    // the overall Plot instance holds the inner scales as well, but the Facet
    // mark does the autoScaling according to the subdimensions defined by its
    // band. note that x and y are autoscaled _independently_! (i mean duh but…)
    autoScaleRange(facetScaleDescriptors, dimensions); // mutates x and y scale ranges
    autoAxisTicks(facetAxes, dimensions);
    autoAxisLabels(facetScaleChannels, facetScaleDescriptors, facetAxes, dimensions);
  } else {
    autoScaleRange(scaleDescriptors, dimensions); // mutates x and y scale ranges
    autoAxisTicks(axes, dimensions); // i guess the axis has the ref to the scale so it updates based on new range?
    autoAxisLabels(scaleChannels, scaleDescriptors, axes, dimensions);
  }

  // Normalize the options.
  options = {...scaleDescriptors, ...dimensions};
  if (axes.x) options.x = {...options.x, ...axes.x};
  if (axes.y) options.y = {...options.y, ...axes.y};
  if (axes.fx) options.fx = {...options.fx, ...axes.fx};
  if (axes.fy) options.fy = {...options.fy, ...axes.fy};

  // When faceting, render axes for fx and fy instead of x and y.
  // TODO cleaner
  if (facet !== undefined) {
    const x = scales.fx ? "fx" : "x";
    const y = scales.fy ? "fy" : "y";
    if (axes[x]) marks.unshift(axes[x]); // stick the axis mark on the front of the marks array
    if (axes[y]) marks.unshift(axes[y]);
  } else {
    if (axes.x) marks.unshift(axes.x);
    if (axes.y) marks.unshift(axes.y);
  }

  const {width, height} = dimensions;

  // man, the actually rendering code is admirally minimal and
  // well-componentized…
  const svg = create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "plot")
      .attr("fill", "currentColor")
      .attr("stroke-miterlimit", 1)
      .attr("text-anchor", "middle")
      .style("font", font)
      .style("max-width", `${width}px`)
      .style("display", display)
      .style("background", background);

  svg.append("style")
      .text(`.plot text { white-space: pre; }`);

  // ok we're ready!! render each mark!!!
  for (const mark of marks) {
    const channels = markChannels.get(mark);
    const index = markIndex.get(mark);
    const node = mark.render(index, scales, channels, options);
    debugger;
    // the mark returns a plain DOM node, which we append to the svg
    if (node != null) svg.append(() => node);
  }

  return svg.node();
}

function Dimensions({y, fy}, {x: xAxis, y: yAxis}, {
  width = 640,
  height = y || fy ? 396 : 60,
  marginTop = xAxis && xAxis.axis === "top" ? 30 : yAxis ? 20 : 0,
  marginRight = yAxis && yAxis.axis === "right" ? 40 : xAxis ? 20 : 0,
  marginBottom = xAxis && xAxis.axis === "bottom" ? 30 : yAxis ? 20 : 0,
  marginLeft = yAxis && yAxis.axis === "left" ? 40 : xAxis ? 20 : 0
} = {}) {
  return {width, height, marginTop, marginRight, marginBottom, marginLeft};
}

function ScaleFunctions(scales) {
  return Object.fromEntries(Object.entries(scales).map(([name, {scale}]) => [name, scale]));
}
