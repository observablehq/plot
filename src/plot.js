import {bisectLeft, cross, difference, groups, InternMap, interpolate, interpolateNumber, select} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, Channels, channelDomain, valueObject} from "./channel.js";
import {Context, create} from "./context.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, isDomainSort, isScaleOptions, keyword, map, maybeNamed, range, second, where, yes} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, exposeScales, coerceNumbers} from "./scales.js";
import {position, registry as scaleRegistry} from "./scales/index.js";
import {inferDomain} from "./scales/quantitative.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {maybeTimeFilter} from "./time.js";
import {basic, initializer} from "./transforms/basic.js";
import {maybeInterval} from "./transforms/interval.js";
import {consumeWarnings} from "./warnings.js";

export function plot(options = {}) {
  const {facet, style, caption, ariaLabel, ariaDescription} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // Flatten any nested marks.
  const marks = options.marks === undefined ? [] : options.marks.flat(Infinity).map(markify);

  // A Map from Mark instance to its render state, including:
  // index - the data index e.g. [0, 1, 2, 3, …]
  // channels - an array of materialized channels e.g. [["x", {value}], …]
  // faceted - a boolean indicating whether this mark is faceted
  // values - an object of scaled values e.g. {x: [40, 32, …], …}
  const stateByMark = new Map();

  // A Map from scale name to an array of associated channels.
  const channelsByScale = new Map();

  // If a scale is explicitly declared in options, initialize its associated
  // channels to the empty array; this will guarantee that a corresponding scale
  // will be created later (even if there are no other channels). But ignore
  // facet scale declarations if faceting is not enabled.
  for (const key of scaleRegistry.keys()) {
    if (isScaleOptions(options[key]) && key !== "fx" && key !== "fy") {
      channelsByScale.set(key, []);
    }
  }

  // Faceting!
  let facets; // array of facet definitions (e.g. [["foo", [0, 1, 3, …]], …])
  let facetIndex; // index over the facet data, e.g. [0, 1, 2, 3, …]
  let facetChannels; // e.g. {fx: {value}, fy: {value}}
  let facetsIndex; // nested array of facet indexes [[0, 1, 3, …], [2, 5, …], …]
  let facetsExclude; // lazily-constructed opposite of facetsIndex
  if (facet !== undefined) {
    const {x, y} = facet;
    if (x != null || y != null) {
      const facetData = arrayify(facet.data);
      if (facetData == null) throw new Error("missing facet data");
      facetChannels = {};
      if (x != null) {
        const fx = Channel(facetData, {value: x, scale: "fx"});
        facetChannels.fx = fx;
        channelsByScale.set("fx", [fx]);
      }
      if (y != null) {
        const fy = Channel(facetData, {value: y, scale: "fy"});
        facetChannels.fy = fy;
        channelsByScale.set("fy", [fy]);
      }
      facetIndex = range(facetData);
      facets = facetGroups(facetIndex, facetChannels);
      facetsIndex = facets.map(second);
    }
  }

  // Initialize the marks’ state.
  for (const mark of marks) {
    if (stateByMark.has(mark)) throw new Error("duplicate mark; each mark must be unique");
    const markFacets = facetsIndex === undefined ? undefined
      : mark.facet === "auto" ? mark.data === facet.data ? facetsIndex : undefined
      : mark.facet === "include" ? facetsIndex
      : mark.facet === "exclude" ? facetsExclude || (facetsExclude = facetsIndex.map(f => Uint32Array.from(difference(facetIndex, f))))
      : undefined;
    const {data, facets, channels} = mark.initialize(markFacets, facetChannels);
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, {data, facets, channels});
  }

  // Initalize the scales and axes.
  const scaleDescriptors = Scales(addScaleChannels(channelsByScale, stateByMark), options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, axes, options);
  const context = Context(options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoAxisTicks(scaleDescriptors, axes);

  const {fx, fy} = scales;
  const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
  const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
  const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};

  // Reinitialize; for deriving channels dependent on other channels.
  const newByScale = new Set();
  for (const [mark, state] of stateByMark) {
    if (mark.initializer != null) {
      const {facets, channels} = mark.initializer(state.data, state.facets, state.channels, scales, subdimensions);
      if (facets !== undefined) state.facets = facets;
      if (channels !== undefined) {
        inferChannelScale(channels, mark);
        applyScaleTransforms(channels, options);
        Object.assign(state.channels, channels);
        for (const {scale} of Object.values(channels)) if (scale != null) newByScale.add(scale);
      }
    }
  }

  // Reconstruct scales if new scaled channels were created during reinitialization.
  if (newByScale.size) {
    for (const key of newByScale) if (scaleRegistry.get(key) === position) throw new Error(`initializers cannot declare position scales: ${key}`);
    const newScaleDescriptors = Scales(addScaleChannels(new Map(), stateByMark, key => newByScale.has(key)), options);
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }

  autoScaleLabels(channelsByScale, scaleDescriptors, axes, dimensions, options);

  // Aggregate and sort time channels.
  const timeChannels = findTimeChannels(stateByMark);
  const timeDomain = inferDomain(timeChannels);
  const times = aggregateTimes(timeChannels);

  // Compute value objects, applying scales as needed.
  for (const state of stateByMark.values()) {
    state.values = valueObject(state.channels, scales);
  }

  const {width, height} = dimensions;

  const svg = create("svg", context)
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
  const axisY = axes[facets !== undefined && fy ? "fy" : "y"];
  const axisX = axes[facets !== undefined && fx ? "fx" : "x"];
  if (axisY) svg.appendChild(axisY.render(null, scales, dimensions, context));
  if (axisX) svg.appendChild(axisX.render(null, scales, dimensions, context));

  // Render (possibly faceted) marks.
  const timeMarks = [];
  if (facets !== undefined) {
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const indexByFacet = facetMap(facetChannels);
    facets.forEach(([key], i) => indexByFacet.set(key, i));
    const selection = select(svg);
    if (fy && axes.y) {
      const axis1 = axes.y, axis2 = nolabel(axis1);
      const j = axis1.labelAnchor === "bottom" ? fyDomain.length - 1 : axis1.labelAnchor === "center" ? fyDomain.length >> 1 : 0;
      selection.selectAll()
        .data(fyDomain)
        .enter()
        .append((ky, i) => (i === j ? axis1 : axis2).render(
          fx && where(fxDomain, kx => indexByFacet.has([kx, ky])),
          scales,
          {...dimensions, ...fyMargins, offsetTop: fy(ky)},
          context
        ));
    }
    if (fx && axes.x) {
      const axis1 = axes.x, axis2 = nolabel(axis1);
      const j = axis1.labelAnchor === "right" ? fxDomain.length - 1 : axis1.labelAnchor === "center" ? fxDomain.length >> 1 : 0;
      const {marginLeft, marginRight} = dimensions;
      selection.selectAll()
        .data(fxDomain)
        .enter()
        .append((kx, i) => (i === j ? axis1 : axis2).render(
          fy && where(fyDomain, ky => indexByFacet.has([kx, ky])),
          scales,
          {...dimensions, ...fxMargins, labelMarginLeft: marginLeft, labelMarginRight: marginRight, offsetLeft: fx(kx)},
          context
        ));
    }
    selection.selectAll()
      .data(facetKeys(scales).filter(indexByFacet.has, indexByFacet))
      .enter()
      .append("g")
        .attr("aria-label", "facet")
        .attr("transform", facetTranslate(fx, fy))
        .each(function(key) {
          const j = indexByFacet.get(key);
          for (const [mark, {channels, values, facets}] of stateByMark) {
            const facet = facets ? mark.filter(facets[j] ?? facets[0], channels, values) : null;
            const node = mark.render(facet, scales, values, subdimensions, context);
            if (channels.time) timeMarks.push({mark, node, facet, interp: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Array.from(value)]))});
            if (node != null) this.appendChild(node);
          }
        });
  } else {
    for (const [mark, {channels, values, facets}] of stateByMark) {
      const facet = facets ? mark.filter(facets[0], channels, values) : null;
      const index = channels.time ? [] : facet;
      const node = mark.render(index, scales, values, dimensions, context);
      if (channels.time) timeMarks.push({mark, node, facet, interp: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Array.from(value)]))});
      if (node != null) svg.appendChild(node);
    }
  }

  if (timeMarks.length) {
    // TODO There needs to be an option to avoid interpolation and just play
    // the distinct times, as given, in ascending order, as keyframes. And
    // there needs to be an option to control the delay, duration, iterations,
    // and other timing parameters of the animation.
    const interpolateTime = interpolateNumber(...timeDomain);
    const delay = 0; // TODO configurable; delay initial rendering
    const duration = 5000; // TODO configurable
    const startTime = performance.now() + delay;
    requestAnimationFrame(function tick() {
      const t = Math.max(0, Math.min(1, (performance.now() - startTime) / duration));
      const currentTime = interpolateTime(t);
      const i0 = bisectLeft(times, currentTime);
      const time0 = times[i0 - 1];
      const time1 = times[i0];
      const timet = (currentTime - time0) / (time1 - time0);
      for (const timeMark of timeMarks) {
        const {mark, node, facet, interp} = timeMark;
        const {values} = stateByMark.get(mark);
        const {time: T} = values;
        let timeNode;
        if (isFinite(timet)) {
          const I0 = facet.filter(i => T[i] === time0); // preceding keyframe
          const I1 = facet.filter(i => T[i] === time1); // following keyframe
          const n = I0.length; // TODO enter, exit, key
          const Ii = I0.map((_, i) => i + facet.length); // TODO optimize

          // TODO This is interpolating the already-scaled values, but we
          // probably want to interpolate in data space instead and then
          // re-apply the scales. I’m not sure what to do for ordinal data,
          // but interpolating in data space will ensure that the resulting
          // instantaneous visualization is meaningful and valid. TODO If the
          // data is sparse (not all series have values for all times), or if
          // the data is inconsistently ordered, then we will need a separate
          // key channel to align the start and end values for interpolation;
          // this code currently assumes that the data is complete and the
          // order is consistent. TODO The sort transform (which happens by
          // default with the dot mark) breaks consistent ordering! TODO If
          // the time filter is not “eq” (strict equals) here, then we’ll need
          // to combine the interpolated data with the filtered data.
          for (const k in values) {
            if (k === "time") {
              for (let i = 0; i < n; ++i) {
                interp[k][Ii[i]] = currentTime;
              }
            } else {
              for (let i = 0; i < n; ++i) {
                interp[k][Ii[i]] = interpolate(values[k][I0[i]], values[k][I1[i]])(timet);
              }
            }
          }

          // TODO We need to switch to using temporal facets so that the
          // facets are guaranteed to be in chronological order. (Within a
          // facet, there’s no guarantee that the index is sorted
          // chronologically.)
          const ifacet = [...facet.filter(i => T[i] < time1), ...(currentTime < time1) ? Ii : [], ...facet.filter(i => T[i] >= time1)];
          const index = mark.timeFilter(ifacet, interp.time, currentTime);
          timeNode = mark.render(index, scales, interp, dimensions, context);
        } else {
          const index = mark.timeFilter(facet, T, currentTime);
          timeNode = mark.render(index, scales, values, dimensions, context);
        }
        node.replaceWith(timeNode);
        timeMark.node = timeNode;
      }
      if (t < 1) requestAnimationFrame(tick);
    });
  }

  // Wrap the plot in a figure with a caption, if desired.
  let figure = svg;
  const legends = Legends(scaleDescriptors, context, options);
  if (caption != null || legends.length > 0) {
    const {document} = context;
    figure = document.createElement("figure");
    figure.style.maxWidth = "initial";
    for (const legend of legends) figure.appendChild(legend);
    figure.appendChild(svg);
    if (caption != null) {
      const figcaption = document.createElement("figcaption");
      figcaption.appendChild(caption instanceof Node ? caption : document.createTextNode(caption));
      figure.appendChild(figcaption);
    }
  }

  figure.scale = exposeScales(scaleDescriptors);
  figure.legend = exposeLegends(scaleDescriptors, context, options);

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

export class Mark {
  constructor(data, channels = {}, options = {}, defaults) {
    const {facet = "auto", sort, time, timeFilter, dx, dy, clip, channels: extraChannels} = options;
    this.data = data;
    this.sort = isDomainSort(sort) ? sort : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    this.facet = facet == null || facet === false ? null : keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
    this.timeFilter = maybeTimeFilter(timeFilter);
    channels = maybeNamed(channels);
    if (extraChannels !== undefined) channels = {...maybeNamed(extraChannels), ...channels};
    if (defaults !== undefined) channels = {...styles(this, options, defaults), ...channels};
    if (time != null) channels = {time: {value: time}, ...channels};
    this.channels = Object.fromEntries(Object.entries(channels).filter(([name, {value, optional}]) => {
      if (value != null) return true;
      if (optional) return false;
      throw new Error(`missing channel value: ${name}`);
    }));
    this.dx = +dx || 0;
    this.dy = +dy || 0;
    this.clip = maybeClip(clip);
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    if (facets === undefined && data != null) facets = [range(data)];
    if (this.transform != null) ({facets, data} = this.transform(data, facets)), data = arrayify(data);
    const channels = Channels(this.channels, data);
    if (this.sort != null) channelDomain(channels, facetChannels, data, this.sort);
    return {data, facets, channels};
  }
  filter(index, channels, values) {
    for (const name in channels) {
      const {filter = defined} = channels[name];
      if (filter !== null) {
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
  return typeof mark?.render === "function" ? mark : new Render(mark);
}

class Render extends Mark {
  constructor(render) {
    super();
    if (render == null) return;
    if (typeof render !== "function") throw new TypeError("invalid mark; missing render function");
    this.render = render;
  }
  render() {}
}

// Note: mutates channel.value to apply the scale transform, if any.
function applyScaleTransforms(channels, options) {
  for (const name in channels) {
    const channel = channels[name];
    const {scale} = channel;
    if (scale != null) {
      const {
        percent,
        interval,
        transform = percent ? x => x * 100 : maybeInterval(interval)?.floor
      } = options[scale] || {};
      if (transform != null) channel.value = map(channel.value, transform);
    }
  }
  return channels;
}

// An initializer may generate channels without knowing how the downstream mark
// will use them. Marks are typically responsible associated scales with
// channels, but here we assume common behavior across marks.
function inferChannelScale(channels) {
  for (const name in channels) {
    const channel = channels[name];
    let {scale} = channel;
    if (scale === true) {
      switch (name) {
        case "fill": case "stroke": scale = "color"; break;
        case "fillOpacity": case "strokeOpacity": case "opacity": scale = "opacity"; break;
        default: scale = scaleRegistry.has(name) ? name : null; break;
      }
      channel.scale = scale;
    }
  }
}

function addScaleChannels(channelsByScale, stateByMark, filter = yes) {
  for (const {channels} of stateByMark.values()) {
    for (const name in channels) {
      const channel = channels[name];
      const {scale} = channel;
      if (scale != null && filter(scale)) {
        const channels = channelsByScale.get(scale);
        if (channels !== undefined) channels.push(channel);
        else channelsByScale.set(scale, [channel]);
      }
    }
  }
  return channelsByScale;
}

// TODO There should be a way to set at explicit domain of the time scale, and
// probably also a way to control whether times are expressed (and coerced) to
// numbers or dates. And maybe non-linear (log or sqrt) time, too, or should
// that be controlled with easing?
function findTimeChannels(stateByMark) {
  const channels = [];
  for (const {channels: {time}} of stateByMark.values()) {
    if (time) {
      coerceNumbers(time.value); // Note: mutates!
      channels.push(time);
    }
  }
  return channels;
}

function aggregateTimes(channels) {
  const times = [];
  for (const {value} of channels) {
    for (let t of value) {
      if (t == null || isNaN(t = +t)) continue;
      const i = bisectLeft(times, t);
      if (times[i] === t) continue;
      times.splice(i, 0, t);
    }
  }
  return times;
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
function facetGroups(index, {fx, fy}) {
  return fx && fy ? facetGroup2(index, fx, fy)
    : fx ? facetGroup1(index, fx)
    : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return groups(index, i => F[i]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
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

function facetMap({fx, fy}) {
  return new (fx && fy ? FacetMap2 : FacetMap);
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
