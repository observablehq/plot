import {create, cross, difference, groups, InternMap} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, channelSort} from "./channel.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, isOptions, keyword, range, first, second, where} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, applyScales, exposeScales} from "./scales.js";
import {applyInlineStyles, maybeClassName, styles} from "./style.js";
import {basic} from "./transforms/basic.js";

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

  for (const mark of marks) {
    const channels = markChannels.get(mark) ?? [];
    const values = applyScales(channels, scales);
    const index = filter(markIndex.get(mark), channels, values);
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

function filter(index, channels, values) {
  for (const [name, {filter = defined}] of channels) {
    if (name !== undefined && filter !== null) {
      const value = values[name];
      index = index.filter(i => filter(value[i]));
    }
  }
  return index;
}

export class Mark {
  constructor(data, channels = [], options = {}, defaults) {
    const {facet = "auto", sort, dx, dy} = options;
    const names = new Set();
    this.data = data;
    this.sort = isOptions(sort) ? sort : null;
    this.facet = facet == null || facet === false ? null : keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
    const {transform} = basic(options);
    this.transform = transform;
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
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    let index = facets === undefined && data != null ? range(data) : facets;
    if (data !== undefined && this.transform !== undefined) {
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
    return {index, channels};
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
      options
    );
    this.marks = marks.flat(Infinity).map(markify);
    // The following fields are set by initialize:
    this.marksChannels = undefined; // array of mark channels
    this.marksIndexByFacet = undefined; // map from facet key to array of mark indexes
  }
  initialize() {
    const {index, channels} = super.initialize();
    const facets = index === undefined ? [] : facetGroups(index, channels);
    const facetsKeys = Array.from(facets, first);
    const facetsIndex = Array.from(facets, second);
    const subchannels = [];
    const marksChannels = this.marksChannels = [];
    const marksIndexByFacet = this.marksIndexByFacet = facetMap(channels);
    for (const facetKey of facetsKeys) {
      marksIndexByFacet.set(facetKey, new Array(this.marks.length));
    }
    let facetsExclude;
    for (let i = 0; i < this.marks.length; ++i) {
      const mark = this.marks[i];
      const {facet} = mark;
      const markFacets = facet === "auto" ? mark.data === this.data ? facetsIndex : undefined
        : facet === "include" ? facetsIndex
        : facet === "exclude" ? facetsExclude || (facetsExclude = facetsIndex.map(f => Uint32Array.from(difference(index, f))))
        : undefined;
      const {index: I, channels: markChannels} = mark.initialize(markFacets, channels);
      // If an index is returned by mark.initialize, its structure depends on
      // whether or not faceting has been applied: it is a flat index ([0, 1, 2,
      // …]) when not faceted, and a nested index ([[0, 1, …], [2, 3, …], …])
      // when faceted.
      if (I !== undefined) {
        if (markFacets) {
          for (let j = 0; j < facetsKeys.length; ++j) {
            marksIndexByFacet.get(facetsKeys[j])[i] = I[j];
          }
        } else {
          for (let j = 0; j < facetsKeys.length; ++j) {
            marksIndexByFacet.get(facetsKeys[j])[i] = I;
          }
        }
      }
      for (const [, channel] of markChannels) {
        subchannels.push([, channel]);
      }
      marksChannels.push(markChannels);
    }
    return {index, channels: [...channels, ...subchannels]};
  }
  render(I, scales, _, dimensions, axes) {
    const {marks, marksChannels, marksIndexByFacet} = this;
    const {fx, fy} = scales;
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
    const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
    const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};
    const marksValues = marksChannels.map(channels => applyScales(channels, scales));
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
                fx && where(fxDomain, kx => marksIndexByFacet.has([kx, ky])),
                scales,
                null,
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
                fy && where(fyDomain, ky => marksIndexByFacet.has([kx, ky])),
                scales,
                null,
                fxDimensions
              ));
          }
        })
        .call(g => g.selectAll()
          .data(facetKeys(scales).filter(marksIndexByFacet.has, marksIndexByFacet))
          .join("g")
            .attr("transform", facetTranslate(fx, fy))
            .each(function(key) {
              const marksFacetIndex = marksIndexByFacet.get(key);
              for (let i = 0; i < marks.length; ++i) {
                const values = marksValues[i];
                const index = filter(marksFacetIndex[i], marksChannels[i], values);
                const node = marks[i].render(index, scales, values, subdimensions);
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
