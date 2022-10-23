import {ascending, cross, group, select, sort} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channels, channelDomain, valueObject} from "./channel.js";
import {Context, create} from "./context.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, isDomainSort, isScaleOptions, keyword, map, maybeNamed, range, where, yes} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, exposeScales} from "./scales.js";
import {position, registry as scaleRegistry} from "./scales/index.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {basic, initializer} from "./transforms/basic.js";
import {maybeInterval} from "./transforms/interval.js";
import {consumeWarnings} from "./warnings.js";
import {excludeIndex, facetKeys, facetTranslate, filterFacets, topFacetRead, facetRead} from "./facet.js";

/** @jsdoc plot */
export function plot(options = {}) {
  const {facet, style, caption, ariaLabel, ariaDescription} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // Flatten any nested marks.
  const marks = options.marks === undefined ? [] : options.marks.flat(Infinity).map(markify);

  // A Map from scale name to an array of associated channels.
  const channelsByScale = new Map();

  // Faceting!
  let facets;

  // A map from top-level facet or mark to facet information, including:
  // * groups - a possibly nested map from facet values to indexes in the data
  //   array
  // * fx - a channel to add to the fx scale
  // * fy - a channel to add to the fy scale
  // * facetChannelLength - the top-level facet indicates a facet channel length
  //   to help warn the user if a different data of the same length is used in a
  //   mark
  // * facetsIndex - In a second pass, a nested array of indices corresponding
  //   to the valid facets
  const facetCollect = new Map();

  // Collect all facet definitions (top-level facets then mark facets),
  // materialize the associated channels, and derive facet scales.
  const topFacetInfo = topFacetRead(facet);
  if (topFacetInfo) facetCollect.set(null, topFacetInfo);

  for (const mark of marks) {
    const f = facetRead(mark, facet, topFacetInfo);
    if (f) facetCollect.set(mark, f);
  }
  for (const f of facetCollect.values()) {
    const {fx, fy} = f;
    if (fx) {
      if (!channelsByScale.has("fx")) channelsByScale.set("fx", []);
      channelsByScale.get("fx").push(fx);
    }
    if (fy) {
      if (!channelsByScale.has("fy")) channelsByScale.set("fy", []);
      channelsByScale.get("fy").push(fy);
    }
  }

  const facetScales = Scales(channelsByScale, options);

  // All the possible facets are given by the domains of fx or fy, or the
  // cross-product of these domains if we facet by both x and y. We sort them in
  // order to apply the facet filters afterwards.
  const fxDomain = facetScales.fx?.scale.domain();
  const fyDomain = facetScales.fy?.scale.domain();
  facets =
    fxDomain && fyDomain
      ? cross(sort(fxDomain, ascending), sort(fyDomain, ascending)).map(([x, y]) => ({x, y}))
      : fxDomain
      ? sort(fxDomain, ascending).map((x) => ({x}))
      : fyDomain
      ? sort(fyDomain, ascending).map((y) => ({y}))
      : undefined;

  if (facets !== undefined) {
    const facetsIndex = topFacetInfo ? filterFacets(facets, topFacetInfo) : undefined;

    // Compute a facet index for each mark, parallel to the facets array.
    for (const mark of marks) {
      const {facet} = mark;
      if (facet === null) continue;
      const {fx: x, fy: y} = mark;
      const facetInfo = facetCollect.get(mark);
      if (facetInfo === undefined) continue;

      // For mark-level facets, compute an index for that mark’s data and options.
      if (x !== undefined || y !== undefined) {
        facetInfo.facetsIndex = filterFacets(facets, facetInfo);
      }

      // Otherwise, link to the top-level facet information.
      else if (topFacetInfo !== undefined) {
        facetInfo.facetsIndex = facetsIndex;
        const {fx, fy} = topFacetInfo;
        if (fx !== undefined) facetInfo.fx = fx;
        if (fy !== undefined) facetInfo.fy = fy;
      }
    }

    // The cross product of the domains of fx and fy can include fx-fy
    // combinations for which no mark has an instance associated with that
    // combination, and therefore we don’t want to render this facet (not even
    // the frame). The same can occur if you specify the domain of fx and fy
    // explicitly, but there is no mark instance associated with some values in
    // the domain. Expunge empty facets, and clear the corresponding elements
    // from the nested index in each mark.
    const nonEmpty = new Set();
    for (const {facetsIndex} of facetCollect.values()) {
      if (facetsIndex) {
        facetsIndex.forEach((index, i) => {
          if (index?.length > 0) nonEmpty.add(i);
        });
      }
    }
    if (0 < nonEmpty.size && nonEmpty.size < facets.length) {
      facets = facets.filter((_, i) => nonEmpty.has(i));
      for (const state of facetCollect.values()) {
        const {facetsIndex} = state;
        //console.warn(facetsIndex);
        if (!facetsIndex) continue;
        state.facetsIndex = facetsIndex.filter((_, i) => nonEmpty.has(i));
      }
    }
  }

  // If a scale is explicitly declared in options, initialize its associated
  // channels to the empty array; this will guarantee that a corresponding scale
  // will be created later (even if there are no other channels). But ignore
  // facet scale declarations if faceting is not enabled.
  for (const key of scaleRegistry.keys()) {
    if (isScaleOptions(options[key]) && key !== "fx" && key !== "fy") {
      channelsByScale.set(key, []);
    }
  }

  // A Map from Mark instance to its render state, including:
  // index - the data index e.g. [0, 1, 2, 3, …]
  // channels - an array of materialized channels e.g. [["x", {value}], …]
  // faceted - a boolean indicating whether this mark is faceted
  // values - an object of scaled values e.g. {x: [40, 32, …], …}
  const stateByMark = new Map();

  // Initialize the marks’ state.
  for (const mark of marks) {
    if (stateByMark.has(mark)) throw new Error("duplicate mark; each mark must be unique");
    const state = facetCollect.get(mark) || {};
    const facetsIndex = mark.facet === "exclude" ? excludeIndex(state.facetsIndex) : state.facetsIndex;
    const {data, facets, channels} = mark.initialize(facetsIndex, state);
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, {data, facets, channels});
  }

  // Initalize the scales and axes.
  const scaleDescriptors = Scales(addScaleChannels(channelsByScale, stateByMark), options);
  const scales = ScaleFunctions(scaleDescriptors);
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, hasGeometry(stateByMark), axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoAxisTicks(scaleDescriptors, axes);

  const {fx, fy} = scales;
  const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
  const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
  const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};
  const context = Context(options, subdimensions);

  // Reinitialize; for deriving channels dependent on other channels.
  const newByScale = new Set();
  for (const [mark, state] of stateByMark) {
    if (mark.initializer != null) {
      const {facets, channels} = mark.initializer(
        state.data,
        state.facets,
        state.channels,
        scales,
        subdimensions,
        context
      );
      if (facets !== undefined) {
        state.facets = facets;
      }
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
    for (const key of newByScale)
      if (scaleRegistry.get(key) === position) throw new Error(`initializers cannot declare position scales: ${key}`);
    const newScaleDescriptors = Scales(
      addScaleChannels(new Map(), stateByMark, (key) => newByScale.has(key)),
      options
    );
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }

  autoScaleLabels(channelsByScale, scaleDescriptors, axes, dimensions, options);

  // Compute value objects, applying scales and projection as needed.
  for (const state of stateByMark.values()) {
    state.values = valueObject(state.channels, scales, context);
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
    .call((svg) =>
      svg.append("style").text(`
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
      `)
    )
    .call(applyInlineStyles, style)
    .node();

  // When faceting, render axes for fx and fy instead of x and y.
  const axisY = axes[facets !== undefined && fy ? "fy" : "y"];
  const axisX = axes[facets !== undefined && fx ? "fx" : "x"];
  if (axisY) svg.appendChild(axisY.render(null, scales, dimensions, context));
  if (axisX) svg.appendChild(axisX.render(null, scales, dimensions, context));

  // Render (possibly faceted) marks.
  if (facets !== undefined) {
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const selection = select(svg);
    if (fy && axes.y) {
      const axis1 = axes.y,
        axis2 = nolabel(axis1);
      const j =
        axis1.labelAnchor === "bottom"
          ? fyDomain.length - 1
          : axis1.labelAnchor === "center"
          ? fyDomain.length >> 1
          : 0;

      // When faceting by both fx and fy, this nested Map allows to look up the
      // non-empty facets and draw the grid lines properly.
      const cx =
        fx &&
        group(
          facets,
          ({y}) => y,
          ({x}) => x
        );
      selection
        .selectAll()
        .data(fyDomain)
        .enter()
        .append((ky, i) =>
          (i === j ? axis1 : axis2).render(
            cx && where(fxDomain, (kx) => cx.get(ky).has(kx)),
            scales,
            {...dimensions, ...fyMargins, offsetTop: fy(ky)},
            context
          )
        );
    }
    if (fx && axes.x) {
      const axis1 = axes.x,
        axis2 = nolabel(axis1);
      const j =
        axis1.labelAnchor === "right" ? fxDomain.length - 1 : axis1.labelAnchor === "center" ? fxDomain.length >> 1 : 0;
      const cy =
        fy &&
        group(
          facets,
          ({x}) => x,
          ({y}) => y
        );
      const {marginLeft, marginRight} = dimensions;
      selection
        .selectAll()
        .data(fxDomain)
        .enter()
        .append((kx, i) =>
          (i === j ? axis1 : axis2).render(
            cy && where(fyDomain, (ky) => cy.get(kx).has(ky)),
            scales,
            {
              ...dimensions,
              ...fxMargins,
              labelMarginLeft: marginLeft,
              labelMarginRight: marginRight,
              offsetLeft: fx(kx)
            },
            context
          )
        );
    }

    // Render facets in the order of the fx-fy domain, which might not be the
    // ordering used to build the nested index initially; see domainChannel.
    const facetPosition = new Map(facets.map((f, j) => [f, j]));
    selection
      .selectAll()
      .data(facetKeys(facets, {fx, fy}))
      .enter()
      .append("g")
      .attr("aria-label", "facet")
      .attr("transform", facetTranslate(fx, fy))
      .each(function (key) {
        for (const [mark, {channels, values, facets}] of stateByMark) {
          const facet = facets ? mark.filter(facets[facetPosition.get(key)] ?? facets[0], channels, values) : null;
          const node = mark.render(facet, scales, values, subdimensions, context);
          if (node != null) this.appendChild(node);
        }
      });
  } else {
    for (const [mark, {channels, values, facets}] of stateByMark) {
      const facet = facets ? mark.filter(facets[0], channels, values) : null;
      const node = mark.render(facet, scales, values, dimensions, context);
      if (node != null) svg.appendChild(node);
    }
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
    select(svg)
      .append("text")
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
    const {facet = "auto", fx, fy, sort, dx, dy, clip, channels: extraChannels} = options;
    this.data = data;
    this.sort = isDomainSort(sort) ? sort : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    if (facet === null || facet === false) {
      this.facet = null;
    } else {
      this.facet = keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
      this.fx = fx;
      this.fy = fy;
    }
    channels = maybeNamed(channels);
    if (extraChannels !== undefined) channels = {...maybeNamed(extraChannels), ...channels};
    if (defaults !== undefined) channels = {...styles(this, options, defaults), ...channels};
    this.channels = Object.fromEntries(
      Object.entries(channels).filter(([name, {value, optional}]) => {
        if (value != null) return true;
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
      })
    );
    this.dx = +dx || 0;
    this.dy = +dy || 0;
    this.clip = maybeClip(clip);
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    if (facets === undefined && data != null) facets = [range(data)];
    if (this.transform != null) ({facets, data} = this.transform(data, facets)), (data = arrayify(data));
    const channels = Channels(this.channels, data);
    if (this.sort != null) channelDomain(channels, facetChannels, data, this.sort);
    return {data, facets, channels};
  }
  filter(index, channels, values) {
    for (const name in channels) {
      const {filter = defined} = channels[name];
      if (filter !== null) {
        const value = values[name];
        index = index.filter((i) => filter(value[i]));
      }
    }
    return index;
  }
  plot({marks = [], ...options} = {}) {
    return plot({...options, marks: [...marks, this]});
  }
}

/** @jsdoc marks */
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
        transform = percent ? (x) => x * 100 : maybeInterval(interval)?.floor
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
        case "fill":
        case "stroke":
          scale = "color";
          break;
        case "fillOpacity":
        case "strokeOpacity":
        case "opacity":
          scale = "opacity";
          break;
        default:
          scale = scaleRegistry.has(name) ? name : null;
          break;
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

function hasGeometry(stateByMark) {
  for (const {channels} of stateByMark.values()) {
    if (channels.geometry) return true;
  }
  return false;
}

// Derives a copy of the specified axis with the label disabled.
function nolabel(axis) {
  return axis === undefined || axis.label === undefined
    ? axis // use the existing axis if unlabeled
    : Object.assign(Object.create(axis), {label: undefined});
}
