import {select} from "d3";
import {Channel, inferChannelScale} from "./channel.js";
import {Context, create} from "./context.js";
import {Dimensions} from "./dimensions.js";
import {Facets, facetExclude, facetGroups, facetOrder, facetTranslate, facetFilter} from "./facet.js";
import {Legends, exposeLegends} from "./legends.js";
import {Mark} from "./mark.js";
import {axisFx, axisFy, axisX, axisY, gridFx, gridFy, gridX, gridY} from "./marks/axis.js";
import {frame} from "./marks/frame.js";
import {arrayify, isColor, isIterable, isNone, isScaleOptions, map, yes, maybeInterval} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, exposeScales, innerDimensions, outerDimensions} from "./scales.js";
import {position, registry as scaleRegistry} from "./scales/index.js";
import {applyInlineStyles, maybeClassName} from "./style.js";
import {consumeWarnings, warn} from "./warnings.js";

/** @jsdoc plot */
export function plot(options = {}) {
  const {facet, style, caption, ariaLabel, ariaDescription} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // Flatten any nested marks.
  const marks = options.marks === undefined ? [] : flatMarks(options.marks);

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

  // Add implicit axis marks. Because this happens after faceting (because it
  // depends on whether faceting is present), we must initialize the facet state
  // of any implicit axes, too.
  const axes = flatMarks(inferAxes(marks, channelsByScale, options));
  for (const mark of axes) {
    const facetState = maybeMarkFacet(mark, topFacetState, options);
    if (facetState) facetStateByMark.set(mark, facetState);
  }
  marks.unshift(...axes);

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
      if (mark.facet === null || mark.facet === "super") continue;
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
    for (const {facetsIndex} of facetStateByMark.values()) {
      facetsIndex?.forEach((index, i) => {
        if (index?.length > 0) {
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
    const {facetsIndex, channels: facetChannels} = facetStateByMark.get(mark) ?? {};
    const {data, facets, channels} = mark.initialize(facetsIndex, facetChannels);
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, {data, facets, channels});
  }

  // Initalize the scales and dimensions.
  const scaleDescriptors = Scales(addScaleChannels(channelsByScale, stateByMark), options);
  const scales = ScaleFunctions(scaleDescriptors);
  const dimensions = Dimensions(scaleDescriptors, marks, options);

  autoScaleRange(scaleDescriptors, dimensions);

  const {fx, fy} = scales;
  const subdimensions = fx || fy ? innerDimensions(scaleDescriptors, dimensions) : dimensions;
  const superdimensions = fx || fy ? actualDimensions(scales, dimensions) : dimensions;
  const context = Context(options, subdimensions, scaleDescriptors);

  // Reinitialize; for deriving channels dependent on other channels.
  const newByScale = new Set();
  for (const [mark, state] of stateByMark) {
    if (mark.initializer != null) {
      const dimensions = mark.facet === "super" ? superdimensions : subdimensions;
      const update = mark.initializer(state.data, state.facets, state.channels, scales, dimensions, context);
      if (update.data !== undefined) {
        state.data = update.data;
      }
      if (update.facets !== undefined) {
        state.facets = update.facets;
      }
      if (update.channels !== undefined) {
        inferChannelScales(update.channels);
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

  // Reconstruct scales if new scaled channels were created during
  // reinitialization. Preserve existing scale labels, if any.
  if (newByScale.size) {
    const newChannelsByScale = new Map();
    addScaleChannels(newChannelsByScale, stateByMark, (key) => newByScale.has(key));
    addScaleChannels(channelsByScale, stateByMark, (key) => newByScale.has(key));
    const newScaleDescriptors = inheritScaleLabels(Scales(newChannelsByScale, options), scaleDescriptors);
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }

  // Compute value objects, applying scales and projection as needed.
  for (const [mark, state] of stateByMark) {
    state.values = mark.scale(state.channels, scales, context);
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

  // Render facets.
  if (facets !== undefined) {
    const facetDomains = {x: fx?.domain(), y: fy?.domain()};

    // Sort the facets to match the fx and fy domains; this is needed because
    // the facets were constructed prior to the fx and fy scales.
    facets.sort(facetOrder(facetDomains));

    // Render the facets.
    select(svg)
      .selectAll()
      .data(facets)
      .enter()
      .append("g")
      .attr("aria-label", "facet")
      .attr("transform", facetTranslate(fx, fy, dimensions))
      .each(function (f) {
        let empty = true;
        for (const mark of marks) {
          if (mark.facet === "super") continue; // rendered below
          const {channels, values, facets: indexes} = stateByMark.get(mark);
          if (!(mark.facetAnchor?.(facets, facetDomains, f) ?? !f.empty)) continue;
          let index = null;
          if (indexes) {
            index = indexes[facetStateByMark.has(mark) ? f.i : 0];
            index = mark.filter(index, channels, values);
            if (index.length === 0) continue;
            index.fi = f.i; // TODO cleaner way of exposing the current facet index?
          }
          const node = mark.render(index, scales, values, subdimensions, context);
          if (node == null) continue;
          empty = false;
          this.appendChild(node);
        }
        if (empty) this.remove();
      });
  }

  // Render non-faceted marks.
  for (const mark of marks) {
    if (facets !== undefined && mark.facet !== "super") continue;
    const {channels, values, facets: indexes} = stateByMark.get(mark);
    let index = null;
    if (indexes) {
      index = indexes[0];
      index = mark.filter(index, channels, values);
      if (index.length === 0) continue;
    }
    const node = mark.render(index, scales, values, superdimensions, context);
    if (node != null) svg.appendChild(node);
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

function plotThis({marks = [], ...options} = {}) {
  return plot({...options, marks: [...marks, this]});
}

// Note: This side-effect avoids a circular dependency.
Mark.prototype.plot = plotThis;

function flatMarks(marks) {
  return marks
    .flat(Infinity)
    .filter((mark) => mark != null)
    .map(markify);
}

function markify(mark) {
  return typeof mark.render === "function" ? mark : new Render(mark);
}

class Render extends Mark {
  constructor(render) {
    if (typeof render !== "function") throw new TypeError("invalid mark; missing render function");
    super();
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
    type,
    percent,
    interval,
    transform = percent ? (x) => x * 100 : maybeInterval(interval, type)?.floor
  } = options[scale] ?? {};
  if (transform != null) channel.value = map(channel.value, transform);
}

// An initializer may generate channels without knowing how the downstream mark
// will use them. Marks are typically responsible associated scales with
// channels, but here we assume common behavior across marks.
function inferChannelScales(channels) {
  for (const name in channels) {
    inferChannelScale(name, channels[name]);
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

// Returns the facet groups, and possibly fx and fy channels, associated with
// the top-level facet option {data, x, y}.
function maybeTopFacet(facet, options) {
  if (facet == null) return;
  const {x, y} = facet;
  if (x == null && y == null) return;
  const data = arrayify(facet.data ?? x ?? y);
  if (data === undefined) throw new Error(`missing facet data`);
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
  if (mark.facet === null || mark.facet === "super") return;

  // This mark defines a mark-level facet. TODO There’s some code duplication
  // here with maybeTopFacet that we could reduce.
  const {fx, fy} = mark;
  if (fx != null || fy != null) {
    const data = arrayify(mark.data ?? fx ?? fy);
    if (data === undefined) throw new Error(`missing facet data in ${mark.ariaLabel}`);
    if (data === null) return; // ignore channel definitions if no data is provided TODO this right?
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

function inferAxes(marks, channelsByScale, options) {
  let {
    projection,
    x = {},
    y = {},
    fx = {},
    fy = {},
    axis,
    grid,
    facet = {},
    facet: {axis: facetAxis = axis, grid: facetGrid} = facet,
    x: {axis: xAxis = axis, grid: xGrid = xAxis === null ? null : grid} = x,
    y: {axis: yAxis = axis, grid: yGrid = yAxis === null ? null : grid} = y,
    fx: {axis: fxAxis = facetAxis, grid: fxGrid = fxAxis === null ? null : facetGrid} = fx,
    fy: {axis: fyAxis = facetAxis, grid: fyGrid = fyAxis === null ? null : facetGrid} = fy
  } = options;

  // Disable axes if the corresponding scale is not present.
  if (projection || (!isScaleOptions(x) && !hasScaleChannel("x", marks))) xAxis = xGrid = null;
  if (projection || (!isScaleOptions(y) && !hasScaleChannel("y", marks))) yAxis = yGrid = null;
  if (!channelsByScale.has("fx")) fxAxis = fxGrid = null;
  if (!channelsByScale.has("fy")) fyAxis = fyGrid = null;

  // Resolve the default implicit axes by checking for explicit ones.
  if (xAxis === undefined) xAxis = !hasAxis(marks, "x");
  if (yAxis === undefined) yAxis = !hasAxis(marks, "y");
  if (fxAxis === undefined) fxAxis = !hasAxis(marks, "fx");
  if (fyAxis === undefined) fyAxis = !hasAxis(marks, "fy");

  // Resolve the default orientation of axes.
  if (xAxis === true) xAxis = "bottom";
  if (yAxis === true) yAxis = "left";
  if (fxAxis === true) fxAxis = xAxis === "top" || xAxis === null ? "bottom" : "top";
  if (fyAxis === true) fyAxis = yAxis === "right" || yAxis === null ? "left" : "right";

  const axes = [];
  maybeGrid(axes, fyGrid, gridFy, fy);
  maybeAxis(axes, fyAxis, axisFy, "right", "left", facet, fy);
  maybeGrid(axes, fxGrid, gridFx, fx);
  maybeAxis(axes, fxAxis, axisFx, "top", "bottom", facet, fx);
  maybeGrid(axes, yGrid, gridY, y);
  maybeAxis(axes, yAxis, axisY, "left", "right", options, y);
  maybeGrid(axes, xGrid, gridX, x);
  maybeAxis(axes, xAxis, axisX, "bottom", "top", options, x);
  return axes;
}

function maybeAxis(axes, axis, axisType, primary, secondary, defaults, options) {
  if (!axis) return;
  const both = isBoth(axis);
  options = axisOptions(both ? primary : axis, defaults, options);
  const {line} = options;
  if ((axisType === axisY || axisType === axisX) && line && !isNone(line)) axes.push(frame(lineOptions(options)));
  axes.push(axisType(options));
  if (both) axes.push(axisType({...options, anchor: secondary, label: null}));
}

function maybeGrid(axes, grid, gridType, options) {
  if (!grid || isNone(grid)) return;
  axes.push(gridType(gridOptions(grid, options)));
}

function isBoth(value) {
  return /^\s*both\s*$/i.test(value);
}

function axisOptions(
  anchor,
  defaults,
  {
    line = defaults.line,
    ticks,
    tickSize,
    tickSpacing,
    tickPadding,
    tickFormat,
    tickRotate,
    fontVariant,
    ariaLabel,
    ariaDescription,
    label = defaults.label,
    labelAnchor,
    labelOffset
  }
) {
  return {
    anchor,
    line,
    ticks,
    tickSize,
    tickSpacing,
    tickPadding,
    tickFormat,
    tickRotate,
    fontVariant,
    ariaLabel,
    ariaDescription,
    label,
    labelAnchor,
    labelOffset
  };
}

function lineOptions(options) {
  const {anchor, line} = options;
  return {anchor, facetAnchor: anchor + "-empty", stroke: line === true ? undefined : line};
}

function gridOptions(
  grid,
  {
    stroke = isColor(grid) ? grid : undefined,
    ticks = isGridTicks(grid) ? grid : undefined,
    tickSpacing,
    ariaLabel,
    ariaDescription
  }
) {
  return {
    stroke,
    ticks,
    tickSpacing,
    ariaLabel,
    ariaDescription
  };
}

function isGridTicks(grid) {
  switch (typeof grid) {
    case "number":
      return true;
    case "string":
      return !isColor(grid);
  }
  return isIterable(grid) || typeof grid?.range === "function";
}

// Is there an explicit axis already present? TODO We probably want a more
// explicit test than looking for the ARIA label, but it does afford some
// flexibility in axis implementation which is nice.
function hasAxis(marks, k) {
  const prefix = `${k}-axis `;
  return marks.some((m) => m.ariaLabel?.startsWith(prefix));
}

function hasScaleChannel(k, marks) {
  for (const mark of marks) {
    for (const key in mark.channels) {
      if (mark.channels[key].scale === k) {
        return true;
      }
    }
  }
  return false;
}

function inheritScaleLabels(newScales, scales) {
  for (const key in newScales) {
    const newScale = newScales[key];
    const scale = scales[key];
    if (newScale.label === undefined && scale) {
      newScale.label = scale.label;
    }
  }
  return newScales;
}

// This differs from the other outerDimensions in that it accounts for rounding
// and outer padding in the fact scales; we want the frame to align exactly with
// the actual range, not the desired range.
function actualDimensions({fx, fy}, dimensions) {
  const {marginTop, marginRight, marginBottom, marginLeft, width, height} = outerDimensions(dimensions);
  const fxr = fx && outerRange(fx);
  const fyr = fy && outerRange(fy);
  return {
    marginTop: fy ? fyr[0] : marginTop,
    marginRight: fx ? width - fxr[1] : marginRight,
    marginBottom: fy ? height - fyr[1] : marginBottom,
    marginLeft: fx ? fxr[0] : marginLeft,
    // Some marks, namely the x- and y-axis labels, want to know what the
    // desired (rather than actual) margins are for positioning.
    inset: {
      marginTop: dimensions.marginTop,
      marginRight: dimensions.marginRight,
      marginBottom: dimensions.marginBottom,
      marginLeft: dimensions.marginLeft
    },
    width,
    height
  };
}

function outerRange(scale) {
  const domain = scale.domain();
  let x1 = scale(domain[0]);
  let x2 = scale(domain[domain.length - 1]);
  if (x2 < x1) [x1, x2] = [x2, x1];
  return [x1, x2 + scale.bandwidth()];
}
