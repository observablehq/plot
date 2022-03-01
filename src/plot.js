import {create, cross, difference, groups, InternMap, select} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, channelSort} from "./channel.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, isOptions, keyword, range, second, where} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, exposeScales} from "./scales.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {basic} from "./transforms/basic.js";
import {consumeWarnings} from "./warnings.js";

export function plot(options = {}) {
  const {facet, style, caption, ariaLabel, ariaDescription} = options;

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

  // Initialize each mark’s state: the (possibly transformed) data, the mark
  // index (often [0, 1, 2, …], referencing elements in data), and any channels,
  // applying scale transforms as needed.
  const markState = new Map();
  for (const mark of marks) {
    if (markState.has(mark)) throw new Error("duplicate mark");
    const {data, index, channels} = mark.initialize();
    applyScaleTransforms(channels, options);
    markState.set(mark, {data, index, channels});
  }

  // Construct the initial scales, axes, and dimensions (a.k.a. geometry). The
  // scale definitions may later be modified by mark layouts.
  const scaleChannels = ScaleChannels(flatChannels(markState));
  const scaleDescriptors = Scales(scaleChannels, options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoScaleLabels(scaleChannels, scaleDescriptors, axes, dimensions, options);
  autoAxisTicks(scaleDescriptors, axes);

  // Apply the scales to the marks’ channels, materializing arrays of scaled
  // values; if there is no associated scale, pass channel values through as-is.
  // TODO Update this comment or maybe rename the Values function: the abstract
  // values were materialized earlier in mark.initialize; here we’re mostly just
  // copying a reference and applying the scale, if any.
  for (const state of markState.values()) {
    state.values = Values(state.channels, scales);
  }

  // If any mark has an associated layout, allow the layout to define a new
  // index, new (visual) values, and new channels. Record any new channels,
  // since if they are associated with scales, we will need to construct new
  // scales below before materializing the corresponding new channel values.
  const newMarkChannels = new Map();
  for (const [mark, state] of markState) {
    if (mark.layout != null) {
      const {data, facets, values, channels} = mark.layout(state.data, [state.index], scales, state.values, dimensions);
      if (data !== undefined) state.data = data; // TODO Not strictly necessary?
      if (facets !== undefined) ([state.index] = facets);
      if (values !== undefined) Object.assign(state.values, values);
      if (channels !== undefined) {
        applyScaleTransforms(channels, options);
        state.channels = mergeChannels(channels, state.channels);
        newMarkChannels.set(mark, channels);
      }
    }
  }

  // If any new channel returned by a mark’s layout is associated with a scale,
  // reconstruct the scale from all associated channels (including channels
  // prior to the layout). And materialize the values of any new channels, even
  // if not associated with a scale.
  if (newMarkChannels.size) {
    const newScaleDescriptors = NewScales(newMarkChannels, markState, options);
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
    for (const [mark, channels] of newMarkChannels) {
      const state = markState.get(mark);
      const newValues = Values(channels, scales);
      state.values = {...state.values, ...newValues};
    }
  }

  // Filter marks.
  // TODO passing scales is messy?
  for (const [mark, state] of markState) {
    const {index, channels, values} = state;
    state.index = mark.filter(index, channels, values, scales);
  }

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
      .attr("aria-label", ariaLabel)
      .attr("aria-description", ariaDescription)
      .call(svg => svg.append("style").text(`
        .${className} {
          display: block;
          background: white;
          height: auto;
          height: intrinsic;
          max-width: 100%;
        }
        .${className} text,
        .${className} tspan {
          white-space: pre;
        }
      `))
      .call(applyInlineStyles, style)
    .node();

  // When faceting, render axes for fx and fy instead of x and y.
  const axisX = axes[facet !== undefined && scales.fx ? "fx" : "x"];
  const axisY = axes[facet !== undefined && scales.fy ? "fy" : "y"];
  if (axisY) svg.appendChild(axisY.render(null, scales, dimensions));
  if (axisX) svg.appendChild(axisX.render(null, scales, dimensions));

  // Render marks.
  for (const [mark, {index, values}] of markState) {
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

  const w = consumeWarnings();
  if (w > 0) {
    select(svg).append("text")
        .attr("x", width)
        .attr("y", 20)
        .attr("dy", "-1em")
        .attr("text-anchor", "end")
        .attr("font-family", "initial") // fix emoji rendering in Chrome
        .text("\u26a0\ufe0f") // emoji variation selector
      .append("title")
        .text(`${w.toLocaleString("en-US")} warning${w === 1 ? "" : "s"}. Please check the console.`);
  }

  return figure;
}

// Given an array of named channels [[name?, channel], …], applies the scale’s
// transform (if any) to the channel values. Note: mutates channel.value!
function applyScaleTransforms(channels, options) {
  for (const [, channel] of channels) {
    const scale = options[channel.scale];
    if (scale == null) continue;
    const {percent, transform = percent ? x => x * 100 : undefined} = scale;
    if (transform == null) continue;
    channel.value = Array.from(channel.value, transform);
  }
  return channels;
}

// Given an array of named channels [[name?, channel], …] and an object of scale
// functions, returns a new object representing the materialized values of named
// channels. TODO use Float64Array.from for position and radius scales?
function Values(channels, scales) {
  const values = Object.create(null);
  for (let [name, {value, scale}] of channels) {
    if (name !== undefined) {
      if (scale !== undefined) {
        scale = scales[scale];
        if (scale !== undefined) {
          value = Array.from(value, scale);
        }
      }
      values[name] = value;
    }
  }
  return values;
}

// Given a map from mark instance to array of associated named channels, returns
// a flat array of all channels present in the map.
function flatChannels(markState) {
  return Array.from(markState.values(), ({channels}) => channels).flat();
}

// Given an array of named channels [[name?, channel], …], group the channels
// by scale, ignoring channels not bound to a scale.
function ScaleChannels(nameChannels) {
  const scaleChannels = new Map();
  for (const [, channel] of nameChannels) {
    const {scale} = channel;
    if (scale !== undefined) {
      if (scaleChannels.has(scale)) scaleChannels.get(scale).push(channel);
      else scaleChannels.set(scale, [channel]);
    }
  }
  return scaleChannels;
}

// Given an array of named channels [[name?, channel], …] representing new
// channels returned by layouts, and a similar array of named channels
// representing all current channels (both old and new), groups the channels by
// scale but including only scales that are referenced in the new channels.
function NewScaleChannels(newNameChannels, nameChannels) {
  const scales = new Set(newNameChannels.map(([, {scale}]) => scale));
  return ScaleChannels(nameChannels.filter(([, {scale}]) => scales.has(scale)));
}

// Given a map from mark instance to array of associated new named channels
// returned by layouts, and a similar map representing all marks’ current
// channels (both old and new), returns an object representing the scale
// descriptors of any scales referenced by the new channels.
function NewScales(newMarkChannels, markState, options) {
  const newNameChannels = Array.from(newMarkChannels.values()).flat();
  const nameChannels = flatChannels(markState);
  const newScaleChannels = NewScaleChannels(newNameChannels, nameChannels);
  return Scales(newScaleChannels, options, true); // only create new scales
}

// Given an array of new named channels associated with a given mark (as
// returned by mark.layout), and a likewise array of old named channels
// previously associated with the same mark (as returned by mark.initialize),
// returns an array representing the resulting union, whereby the newly added
// channels replace old channels of the same name, if any.
function mergeChannels(newChannels, oldChannels) {
  const channels = [...oldChannels];
  const index = new Map(channels.map(([name], i) => [name, i]));
  for (const nameChannel of newChannels) {
    const [name] = nameChannel;
    if (name != null && index.has(name)) channels[index.get(name)] = nameChannel;
    else channels.push(nameChannel);
  }
  return channels;
}

export class Mark {
  constructor(data, channels = [], options = {}, defaults) {
    const {facet = "auto", sort, dx, dy, clip} = options;
    const names = new Set();
    this.data = data;
    this.sort = isOptions(sort) ? sort : null;
    this.facet = facet == null || facet === false ? null : keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
    const {transform} = basic(options);
    this.transform = transform;
    this.layout = options.layout;
    if (defaults !== undefined) channels = styles(this, options, channels, defaults);
    this.channels = channels.filter(channel => {
      const {name, value, optional} = channel;
      if (value == null) {
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
      }
      if (name !== undefined) {
        const key = `${name}`;
        if (key === "__proto__") throw new Error("illegal channel name");
        if (names.has(key)) throw new Error(`duplicate channel: ${key}`);
        names.add(key);
      }
      return true;
    });
    this.dx = +dx || 0;
    this.dy = +dy || 0;
    this.clip = maybeClip(clip);
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    let index = facets === undefined && data != null ? range(data) : facets;
    if (data !== undefined && this.transform != null) {
      if (facets === undefined) index = index.length ? [index] : [];
      ({facets: index, data} = this.transform(data, index));
      data = arrayify(data);
      if (facets === undefined && index.length) ([index] = index);
    }
    const channels = this.channels.map(channel => {
      const {name} = channel;
      return [name == null ? undefined : `${name}`, Channel(data, channel)];
    });
    if (this.sort != null) channelSort(channels, facetChannels, data, this.sort);
    return {data, index, channels};
  }
  filter(index, channels, values) {
    for (const [name, {filter = defined}] of channels) {
      if (name !== undefined && filter !== null) {
        const value = values[name];
        index = index.filter(i => filter(value[i]));
      }
    }
    return index;
  }
  plot({marks = [], ...options} = {}) {
    return plot({...options, marks: [...marks, this]});
  }
}

export function marks(...marks) {
  marks.plot = Mark.prototype.plot;
  return marks;
}

function markify(mark) {
  return mark instanceof Mark ? mark : new Render(mark);
}

class Render extends Mark {
  constructor(render) {
    super();
    if (render == null) return;
    if (typeof render !== "function") throw new TypeError("invalid mark");
    this.render = render;
  }
  render() {}
}

function facets(data, {x, y, ...options}, marks) {
  return x === undefined && y === undefined
    ? marks // if no facets are specified, ignore!
    : [new Facet(data, {x, y, ...options}, marks)];
}

class Facet extends Mark {
  constructor(data, {x, y, ...options} = {}, marks = []) {
    if (data == null) throw new Error("missing facet data");
    super(
      data,
      [
        {name: "fx", value: x, scale: "fx", optional: true},
        {name: "fy", value: y, scale: "fy", optional: true}
      ],
      {
        ...options,
        layout: Facet.prototype.layout
      }
    );
    this.marks = marks.flat(Infinity).map(markify);
    // The following fields are set by initialize:
    this.facetIndex = undefined; // map from facet key to facet index
    this.marksState = undefined; // array of mark state
  }
  initialize() {
    const {data, index, channels} = super.initialize();
    const facets = index === undefined ? [] : facetGroups(index, channels);
    const facetsIndex = Array.from(facets, second);
    const subchannels = channels.slice();
    const marksState = this.marksState = [];
    const facetIndex = this.facetIndex = facetMap(channels);
    for (let i = 0; i < facets.length; ++i) facetIndex.set(facets[i][0], i);
    let facetsExclude; // lazily constructed, if needed
    for (const mark of this.marks) {
      const {facet} = mark;
      const markFacets = facet === "auto" ? mark.data === this.data ? facetsIndex : undefined
        : facet === "include" ? facetsIndex
        : facet === "exclude" ? facetsExclude || (facetsExclude = facetsIndex.map(f => Uint32Array.from(difference(index, f))))
        : undefined;
      const {data: markData, index: markIndex, channels: markChannels} = mark.initialize(markFacets, channels);
      for (const [, channel] of markChannels) subchannels.push([, channel]); // anonymize channels
      marksState.push({data: markData, facets: markFacets, index: markIndex, channels: markChannels});
    }
    return {data, index, channels: subchannels};
  }
  layout(data, facets, scales, values, dimensions) {
    const {marks, marksState} = this;

    // Compute the dimensions (geometry) of individual facets.
    const {fx, fy} = scales;
    const subdimensions = {
      ...dimensions,
      ...fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()},
      ...fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()}
    };

    // Apply the scales to the marks’ channels, materializing arrays of scaled
    // values; if there is no associated scale, pass channel values through as-is.
    for (const state of marksState) {
      state.values = Values(state.channels, scales);
    }

    // If any mark has an associated layout, allow the layout to define a new
    // index, new (visual) values, and new channels. Record any new channels,
    // since if they are associated with scales, we will need to construct new
    // scales below before materializing the corresponding new channel values.
    let newChannels;
    for (let i = 0; i < marks.length; ++i) {
      const mark = marks[i];
      if (mark.layout != null) {
        const state = marksState[i];
        const {data, facets, values, channels} = mark.layout(state.data, state.facets ? state.index : [state.index], scales, state.values, subdimensions);
        if (data !== undefined) state.data = data;
        if (facets !== undefined) state.facets ? state.index = facets : [state.index] = facets;
        if (values !== undefined) Object.assign(state.values, values);
        if (channels !== undefined) {
          if (newChannels === undefined) newChannels = [];
          state.channels = mergeChannels(channels, state.channels);
          state.newChannels = channels; // to recompute values after scales
          for (const [, c] of channels) newChannels.push([, c]); // anonymize channels
        }
      }
    }

    return {channels: newChannels};
  }
  filter(index, channels, values, scales) {
    for (const state of this.marksState) {
      if (state.newChannels) {
        Object.assign(state.values, Values(state.newChannels, scales));
      }
    }
    return index;
  }
  render(index, scales, values, dimensions, axes) {
    const {facetIndex, marks, marksState} = this;
    const {fx, fy} = scales;
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
    const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
    const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};
    return create("svg:g")
        .call(g => {
          if (fy && axes.y) {
            const axis1 = axes.y, axis2 = nolabel(axis1);
            const j = axis1.labelAnchor === "bottom" ? fyDomain.length - 1 : axis1.labelAnchor === "center" ? fyDomain.length >> 1 : 0;
            const fyDimensions = {...dimensions, ...fyMargins};
            g.selectAll()
              .data(fyDomain)
              .join("g")
              .attr("transform", ky => `translate(0,${fy(ky)})`)
              .append((ky, i) => (i === j ? axis1 : axis2).render(
                fx && where(fxDomain, kx => facetIndex.has([kx, ky])),
                scales,
                fyDimensions
              ));
          }
          if (fx && axes.x) {
            const axis1 = axes.x, axis2 = nolabel(axis1);
            const j = axis1.labelAnchor === "right" ? fxDomain.length - 1 : axis1.labelAnchor === "center" ? fxDomain.length >> 1 : 0;
            const {marginLeft, marginRight} = dimensions;
            const fxDimensions = {...dimensions, ...fxMargins, labelMarginLeft: marginLeft, labelMarginRight: marginRight};
            g.selectAll()
              .data(fxDomain)
              .join("g")
              .attr("transform", kx => `translate(${fx(kx)},0)`)
              .append((kx, i) => (i === j ? axis1 : axis2).render(
                fy && where(fyDomain, ky => facetIndex.has([kx, ky])),
                scales,
                fxDimensions
              ));
          }
        })
        .call(g => g.selectAll()
          .data(facetKeys(scales).filter(facetIndex.has, this.facetIndex))
          .join("g")
            .attr("transform", facetTranslate(fx, fy))
            .each(function(key) {
              const j = facetIndex.get(key);
              for (let i = 0; i < marks.length; ++i) {
                const mark = marks[i];
                const state = marksState[i];
                const index = mark.filter(state.facets ? state.index[j] : state.index, state.channels, state.values);
                const node = mark.render(index, scales, state.values, subdimensions);
                if (node != null) this.appendChild(node);
              }
            }))
      .node();
  }
}

// Derives a copy of the specified axis with the label disabled.
function nolabel(axis) {
  return axis === undefined || axis.label === undefined
    ? axis // use the existing axis if unlabeled
    : Object.assign(Object.create(axis), {label: undefined});
}

// Unlike facetGroups, which returns groups in order of input data, this returns
// keys in order of the associated scale’s domains.
function facetKeys({fx, fy}) {
  return fx && fy ? cross(fx.domain(), fy.domain())
    : fx ? fx.domain()
    : fy.domain();
}

// Returns an array of [[key1, index1], [key2, index2], …] representing the data
// indexes associated with each facet. For two-dimensional faceting, each key
// is a two-element array; see also facetMap.
function facetGroups(index, channels) {
  return (channels.length > 1 ? facetGroup2 : facetGroup1)(index, ...channels);
}

function facetGroup1(index, [, {value: F}]) {
  return groups(index, i => F[i]);
}

function facetGroup2(index, [, {value: FX}], [, {value: FY}]) {
  return groups(index, i => FX[i], i => FY[i])
    .flatMap(([x, xgroup]) => xgroup
    .map(([y, ygroup]) => [[x, y], ygroup]));
}

// This must match the key structure returned by facetGroups.
function facetTranslate(fx, fy) {
  return fx && fy ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx ? kx => `translate(${fx(kx)},0)`
    : ky => `translate(0,${fy(ky)})`;
}

function facetMap(channels) {
  return new (channels.length > 1 ? FacetMap2 : FacetMap);
}

class FacetMap {
  constructor() {
    this._ = new InternMap();
  }
  has(key) {
    return this._.has(key);
  }
  get(key) {
    return this._.get(key);
  }
  set(key, value) {
    return this._.set(key, value), this;
  }
}

// A Map-like interface that supports paired keys.
class FacetMap2 extends FacetMap {
  has([key1, key2]) {
    const map = super.get(key1);
    return map ? map.has(key2) : false;
  }
  get([key1, key2]) {
    const map = super.get(key1);
    return map && map.get(key2);
  }
  set([key1, key2], value) {
    const map = super.get(key1);
    if (map) map.set(key2, value);
    else super.set(key1, new InternMap([[key2, value]]));
    return this;
  }
}
