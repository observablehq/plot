import {group, select} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, Channels, channelDomain, valueObject} from "./channel.js";
import {Context, create} from "./context.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Facets, facetExclude, facetGroups, facetOrder, facetTranslate, facetFilter, maybeFacetAnchor} from "./facet.js";
import {Legends, exposeLegends} from "./legends.js";
import {arrayify, isDomainSort, isScaleOptions, map, range, where, yes} from "./options.js";
import {keyword, maybeNamed} from "./options.js";
import {maybeProject} from "./projection.js";
import {Scales, ScaleFunctions, autoScaleRange, exposeScales} from "./scales.js";
import {position, registry as scaleRegistry} from "./scales/index.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {basic, initializer} from "./transforms/basic.js";
import {maybeInterval} from "./transforms/interval.js";
import {consumeWarnings, warn} from "./warnings.js";

/** @jsdoc plot */
export function plot(options = {}) {
  const {facet, style, caption, ariaLabel, ariaDescription} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // Flatten any nested marks.
  const marks =
    options.marks === undefined
      ? []
      : options.marks
          .flat(Infinity)
          .filter((mark) => mark != null)
          .map(markify);

  // Compute the top-level facet state. This has roughly the same structure as
  // mark-specific facet state, except there isn’t a facetsIndex, and there’s a
  // data and dataLength so we can warn the user if a different data of the same
  // length is used in a mark.
  const topFacetState = maybeTopFacet(facet, options);

  // Construct a map from (faceted) Mark instance to facet state, including:
  // channels - an {fx?, fy?} object to add to the fx and fy scale
  // groups - a possibly-nested map from facet values to indexes in the data array
  // facetsIndex - a sparse nested array of indices corresponding to the valid facets
  const facetStateByMark = new Map();
  for (const mark of marks) {
    const facetState = maybeMarkFacet(mark, topFacetState, options);
    if (facetState) facetStateByMark.set(mark, facetState);
  }

  // Compute a Map from scale name to an array of associated channels.
  const channelsByScale = new Map();
  if (topFacetState) addScaleChannels(channelsByScale, [topFacetState]);
  addScaleChannels(channelsByScale, facetStateByMark);

  // All the possible facets are given by the domains of the fx or fy scales, or
  // the cross-product of these domains if we facet by both x and y. We sort
  // them in order to apply the facet filters afterwards.
  const facets = Facets(channelsByScale, options);

  if (facets !== undefined) {
    const topFacetsIndex = topFacetState ? facetFilter(facets, topFacetState) : undefined;

    // Compute a facet index for each mark, parallel to the facets array. For
    // mark-level facets, compute an index for that mark’s data and options.
    // Otherwise, use the top-level facet index.
    for (const mark of marks) {
      if (mark.facet === null) continue;
      const facetState = facetStateByMark.get(mark);
      if (facetState === undefined) continue;
      facetState.facetsIndex = mark.fx != null || mark.fy != null ? facetFilter(facets, facetState) : topFacetsIndex;
    }

    // The cross product of the domains of fx and fy can include fx-fy
    // combinations for which no mark has an instance associated with that
    // combination, and therefore we don’t want to render this facet (not even
    // the frame). The same can occur if you specify the domain of fx and fy
    // explicitly, but there is no mark instance associated with some values in
    // the domain. Expunge empty facets, and clear the corresponding elements
    // from the nested index in each mark.
    const nonEmpty = new Set();
    for (const [mark, {facetsIndex}] of facetStateByMark) {
      facetsIndex?.forEach((index, i) => {
        if (index?.length > 0 && !mark.decoration) {
          nonEmpty.add(i);
        }
      });
    }

    // If all the facets are empty (as when none of the marks are actually
    // faceted), none of them are empty.
    facets.forEach(
      0 < nonEmpty.size && nonEmpty.size < facets.length
        ? (f, i) => (f.empty = !nonEmpty.has(i))
        : (f) => (f.empty = false)
    );

    // For any mark using the “exclude” facet mode, invert the index.
    for (const mark of marks) {
      if (mark.facet === "exclude") {
        const facetState = facetStateByMark.get(mark);
        facetState.facetsIndex = facetExclude(facetState.facetsIndex);
      }
    }
  }

  // If a scale is explicitly declared in options, initialize its associated
  // channels to the empty array; this will guarantee that a corresponding scale
  // will be created later (even if there are no other channels). Ignore facet
  // scale declarations, which are handled above.
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
    const {facetsIndex, channels: facetChannels} = facetStateByMark.get(mark) || {};
    const {data, facets, channels} = mark.initialize(facetsIndex, facetChannels);
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
  const context = Context(options, subdimensions, scaleDescriptors);

  // Reinitialize; for deriving channels dependent on other channels.
  const newByScale = new Set();
  for (const [mark, state] of stateByMark) {
    if (mark.initializer != null) {
      const update = mark.initializer(state.data, state.facets, state.channels, scales, subdimensions, context);
      if (update.data !== undefined) {
        state.data = update.data;
      }
      if (update.facets !== undefined) {
        state.facets = update.facets;
      }
      if (update.channels !== undefined) {
        inferChannelScale(update.channels, mark);
        Object.assign(state.channels, update.channels);
        for (const channel of Object.values(update.channels)) {
          const {scale} = channel;
          // Initializers aren’t allowed to redefine position scales as this
          // would introduce a circular dependency; so simply scale these
          // channels as-is rather than creating new scales, and assume that
          // they already have the scale’s transform applied, if any (e.g., when
          // generating ticks for the axis mark).
          if (scale != null && scaleRegistry.get(scale) !== position) {
            applyScaleTransform(channel, options);
            newByScale.add(scale);
          }
        }
        // If the initializer returns new mark-level facet channels, we must
        // also recompute the facet state.
        const {fx, fy} = update.channels;
        if (fx != null || fy != null) {
          const facetState = facetStateByMark.get(mark) ?? {channels: {}};
          if (fx != null) facetState.channels.fx = fx;
          if (fy != null) facetState.channels.fy = fy;
          facetState.groups = facetGroups(state.data, facetState.channels);
          facetState.facetsIndex = state.facets = facetFilter(facets, facetState);
          facetStateByMark.set(mark, facetState);
        }
      }
    }
  }

  // Reconstruct scales if new scaled channels were created during reinitialization.
  if (newByScale.size) {
    const newScaleDescriptors = Scales(
      addScaleChannels(new Map(), stateByMark, (key) => newByScale.has(key)),
      options
    );
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }

  autoScaleLabels(channelsByScale, scaleDescriptors, axes, dimensions, options);

  // Compute value objects, applying scales as needed.
  for (const state of stateByMark.values()) {
    state.values = valueObject(state.channels, scales);
  }

  // Apply projection as needed.
  if (context.projection) {
    for (const [mark, state] of stateByMark) {
      mark.project(state.channels, state.values, context);
    }
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
    const selection = select(svg);
    const facetDomains = {x: fx?.domain(), y: fy?.domain()};

    // Sort the facets to match the fx and fy domains; this is needed because
    // the facets were constructed prior to the fx and fy scales.
    facets.sort(facetOrder(facetDomains));

    // When faceting by both fx and fy, this nested Map allows to look up the
    // non-empty facets and draw the grid lines properly. TODO We also
    // effectively need this for skipping empty facets, but we’re doing the
    // slower iterative scanning of the domain.
    const fxy =
      fx && fy && (axes.x || axes.y)
        ? group(
            facets.filter((f) => !f.empty),
            ({x}) => x,
            ({y}) => y
          )
        : undefined;

    // Render the fy axis.
    if (fy && axes.y) {
      const axis1 = axes.y,
        axis2 = nolabel(axis1);
      const j =
        axis1.labelAnchor === "bottom"
          ? facetDomains.y.length - 1
          : axis1.labelAnchor === "center"
          ? facetDomains.y.length >> 1
          : 0;
      selection
        .selectAll()
        .data(facetDomains.y)
        .enter()
        .append((ky, i) =>
          (i === j ? axis1 : axis2).render(
            fx && where(facetDomains.x, (kx) => fxy.get(kx).has(ky)),
            scales,
            {...dimensions, ...fyMargins, offsetTop: fy(ky)},
            context
          )
        );
    }

    // Render the fx axis.
    if (fx && axes.x) {
      const axis1 = axes.x,
        axis2 = nolabel(axis1);
      const j =
        axis1.labelAnchor === "right"
          ? facetDomains.x.length - 1
          : axis1.labelAnchor === "center"
          ? facetDomains.x.length >> 1
          : 0;
      const {marginLeft, marginRight} = dimensions;
      selection
        .selectAll()
        .data(facetDomains.x)
        .enter()
        .append((kx, i) =>
          (i === j ? axis1 : axis2).render(
            fy && where(facetDomains.y, (ky) => fxy.get(kx).has(ky)),
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

    // Render the facets.
    selection
      .selectAll()
      .data(facets)
      .enter()
      .append("g")
      .attr("aria-label", "facet")
      .attr("transform", facetTranslate(fx, fy))
      .each(function (f) {
        let empty = true;
        for (const [mark, {channels, values, facets: indexes}] of stateByMark) {
          if (mark.facetAnchor?.(facets, facetDomains, f) ?? f.empty) continue;
          let index;
          if (indexes) {
            if (!facetStateByMark.has(mark)) index = indexes[0];
            else if (!(index = indexes[f.i])) continue;
            if ((index = mark.filter(index, channels, values)).length === 0) continue;
          }
          const node = mark.render(index, scales, values, subdimensions, context);
          if (node == null) continue;
          empty = false;
          this.appendChild(node);
        }
        if (empty) this.remove();
      });
  } else {
    for (const [mark, {channels, values, facets: indexes}] of stateByMark) {
      let index = null;
      if (indexes) {
        if (!(index = indexes[0])) continue;
        if ((index = mark.filter(index, channels, values)).length === 0) continue;
      }
      const node = mark.render(index, scales, values, dimensions, context);
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
    const {facet = "auto", facetAnchor, fx, fy, sort, dx, dy, clip, decoration, channels: extraChannels} = options;
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
    this.decoration = decoration;
    this.facetAnchor = maybeFacetAnchor(facetAnchor);
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
    if (this.sort != null) channelDomain(channels, facetChannels, data, this.sort); // mutates facetChannels!
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
  // If there is a projection, and there are both x and y channels (or x1 and
  // y1, or x2 and y2 channels), and those channels are associated with the x
  // and y scale respectively (and not already in screen coordinates as with an
  // initializer), then apply the projection, replacing the x and y values. Note
  // that the x and y scales themselves don’t exist if there is a projection,
  // but whether the channels are associated with scales still determines
  // whether the projection should apply; think of the projection as a
  // combination xy-scale.
  project(channels, values, context) {
    maybeProject("x", "y", channels, values, context);
    maybeProject("x1", "y1", channels, values, context);
    maybeProject("x2", "y2", channels, values, context);
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
  return typeof mark.render === "function" ? mark : new Render(mark);
}

class Render extends Mark {
  constructor(render) {
    super();
    if (typeof render !== "function") throw new TypeError("invalid mark; missing render function");
    this.render = render;
  }
  render() {}
}

// Note: mutates channel.value to apply the scale transform, if any.
function applyScaleTransforms(channels, options) {
  for (const name in channels) applyScaleTransform(channels[name], options);
  return channels;
}

// Note: mutates channel.value to apply the scale transform, if any.
function applyScaleTransform(channel, options) {
  const {scale} = channel;
  if (scale == null) return;
  const {
    percent,
    interval,
    transform = percent ? (x) => x * 100 : maybeInterval(interval)?.floor
  } = options[scale] ?? {};
  if (transform != null) channel.value = map(channel.value, transform);
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
        const scaleChannels = channelsByScale.get(scale);
        if (scaleChannels !== undefined) scaleChannels.push(channel);
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

// Returns the facet groups, and possibly fx and fy channels, associated with
// the top-level facet option {data, x, y}.
function maybeTopFacet(facet, options) {
  if (facet == null) return;
  const {x, y} = facet;
  if (x == null && y == null) return;
  const data = arrayify(facet.data);
  if (data == null) throw new Error(`missing facet data`);
  const channels = {};
  if (x != null) channels.fx = Channel(data, {value: x, scale: "fx"});
  if (y != null) channels.fy = Channel(data, {value: y, scale: "fy"});
  applyScaleTransforms(channels, options);
  const groups = facetGroups(data, channels);
  return {channels, groups, data: facet.data};
}

// Returns the facet groups, and possibly fx and fy channels, associated with a
// mark, either through top-level faceting or mark-level facet options {fx, fy}.
function maybeMarkFacet(mark, topFacetState, options) {
  if (mark.facet === null) return;

  // This mark defines a mark-level facet. TODO There’s some code duplication
  // here with maybeTopFacet that we could reduce.
  const {fx, fy} = mark;
  if (fx != null || fy != null) {
    const data = arrayify(mark.data);
    if (data == null) return; // ignore channel definitions if no data is provided
    const channels = {};
    if (fx != null) channels.fx = Channel(data, {value: fx, scale: "fx"});
    if (fy != null) channels.fy = Channel(data, {value: fy, scale: "fy"});
    applyScaleTransforms(channels, options);
    return {channels, groups: facetGroups(data, channels)};
  }

  // This mark links to a top-level facet, if present.
  if (topFacetState === undefined) return;

  // TODO Can we link the top-level facet channels here?
  const {channels, groups, data} = topFacetState;
  if (mark.facet !== "auto" || mark.data === data) return {channels, groups};

  // Warn for the common pitfall of wanting to facet mapped data with the
  // top-level facet option.
  if (
    (groups.size > 1 || (groups.size === 1 && channels.fx && channels.fy && [...groups][0][1].size > 1)) &&
    arrayify(mark.data)?.length === data.length
  ) {
    warn(
      `Warning: the ${mark.ariaLabel} mark appears to use faceted data, but isn’t faceted. The mark data has the same length as the facet data and the mark facet option is "auto", but the mark data and facet data are distinct. If this mark should be faceted, set the mark facet option to true; otherwise, suppress this warning by setting the mark facet option to false.`
    );
  }
}
