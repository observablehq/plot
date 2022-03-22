import {create, cross, difference, groups, InternMap, select} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, channelSort} from "./channel.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, isOptions, keyword, range, second, where} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, applyScales, exposeScales} from "./scales.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {basic} from "./transforms/basic.js";
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

  // Faceting!
  let facets; // array of facet definitions (e.g. [["foo", [0, 1, 3, …]], …])
  let facetIndex; // index over the facet data, e.g. [0, 1, 2, 3, …]
  let facetChannels; // e.g. [["fx", {value}], ["fy", {value}]]
  let facetsIndex; // nested array of facet indexes [[0, 1, 3, …], [2, 5, …], …]
  let facetsExclude; // lazily-constructed opposite of facetsIndex
  if (facet !== undefined) {
    const {x, y} = facet;
    if (x != null || y != null) {
      const facetData = arrayify(facet.data);
      facetChannels = [];
      if (x != null) {
        const fx = Channel(facetData, {value: x, scale: "fx"});
        facetChannels.push(["fx", fx]);
        channelsByScale.set("fx", [fx]);
      }
      if (y != null) {
        const fy = Channel(facetData, {value: y, scale: "fy"});
        facetChannels.push(["fy", fy]);
        channelsByScale.set("fy", [fy]);
      }
      facetIndex = range(facetData);
      facets = facetGroups(facetIndex, facetChannels);
      facetsIndex = Array.from(facets, second);
    }
  }

  // Initialize the marks’ channels, indexing them by mark and scale as needed.
  for (const mark of marks) {
    if (stateByMark.has(mark)) throw new Error("duplicate mark; each mark must be unique");
    const markFacets = facets === undefined ? undefined
      : mark.facet === "auto" ? mark.data === facet.data ? facetsIndex : undefined
      : mark.facet === "include" ? facetsIndex
      : mark.facet === "exclude" ? facetsExclude || (facetsExclude = facetsIndex.map(f => Uint32Array.from(difference(facetIndex, f))))
      : undefined;
    const {index, channels} = mark.initialize(markFacets, facetChannels);
    for (const [, channel] of channels) {
      const {scale} = channel;
      if (scale !== undefined) {
        const channels = channelsByScale.get(scale);
        if (channels !== undefined) channels.push(channel);
        else channelsByScale.set(scale, [channel]);
      }
    }
    stateByMark.set(mark, {index, channels, faceted: markFacets !== undefined});
  }

  // Apply scale transforms, mutating channel.value.
  for (const [scale, channels] of channelsByScale) {
    const {percent, transform = percent ? x => x * 100 : undefined} = options[scale] || {};
    if (transform != null) for (const c of channels) c.value = Array.from(c.value, transform);
  }

  const scaleDescriptors = Scales(channelsByScale, options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoScaleLabels(channelsByScale, scaleDescriptors, axes, dimensions, options);
  autoAxisTicks(scaleDescriptors, axes);

  // Compute value objects, applying scales as needed.
  for (const state of stateByMark.values()) {
    state.values = applyScales(state.channels, scales);
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
  const {fx, fy} = scales;
  const axisY = axes[facets !== undefined && fy ? "fy" : "y"];
  const axisX = axes[facets !== undefined && fx ? "fx" : "x"];
  if (axisY) svg.appendChild(axisY.render(null, scales, dimensions));
  if (axisX) svg.appendChild(axisX.render(null, scales, dimensions));

  // Render (possibly faceted) marks.
  if (facets !== undefined) {
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
    const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
    const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};
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
          {...dimensions, ...fyMargins, offsetTop: fy(ky)}
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
          {...dimensions, ...fxMargins, labelMarginLeft: marginLeft, labelMarginRight: marginRight, offsetLeft: fx(kx)}
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
          for (const [mark, {channels, values, index, faceted}] of stateByMark) {
            const renderIndex = mark.filter(faceted ? index[j] : index, channels, values);
            const node = mark.render(renderIndex, scales, values, subdimensions);
            if (node != null) this.appendChild(node);
          }
        });
  } else {
    for (const [mark, {channels, values, index}] of stateByMark) {
      const renderIndex = mark.filter(index, channels, values);
      const node = mark.render(renderIndex, scales, values, dimensions);
      if (node != null) svg.appendChild(node);
    }
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

export class Mark {
  constructor(data, channels = [], options = {}, defaults) {
    const {facet = "auto", sort, dx, dy, clip} = options;
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
      if (name == null) throw new Error("missing channel name");
      const key = `${name}`;
      if (key === "__proto__") throw new Error(`illegal channel name: ${key}`);
      if (names.has(key)) throw new Error(`duplicate channel: ${key}`);
      names.add(key);
      return true;
    });
    this.dx = +dx || 0;
    this.dy = +dy || 0;
    this.clip = maybeClip(clip);
  }
  initialize(facetIndex, facetChannels) {
    let data = arrayify(this.data);
    let index = facetIndex === undefined && data != null ? range(data) : facetIndex;
    if (data !== undefined && this.transform !== undefined) {
      if (facetIndex === undefined) index = index.length ? [index] : [];
      ({facets: index, data} = this.transform(data, index));
      data = arrayify(data);
      if (facetIndex === undefined && index.length) ([index] = index);
    }
    const channels = this.channels.map(channel => {
      const {name} = channel;
      return [name == null ? undefined : `${name}`, Channel(data, channel)];
    });
    if (this.sort != null) channelSort(channels, facetChannels, data, this.sort);
    return {index, channels};
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
    if (typeof render !== "function") throw new TypeError("invalid mark; missing render function");
    this.render = render;
  }
  render() {}
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
