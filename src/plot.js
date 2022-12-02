import {ascending, cross, group, intersection, sum, select, sort} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, Channels, channelDomain, valueObject} from "./channel.js";
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
import {consumeWarnings, warn} from "./warnings.js";

/** @jsdoc plot */
export function plot(options = {}) {
  const {facet, style, caption, ariaLabel, ariaDescription} = options;

  // className for inline styles
  const className = maybeClassName(options.className);

  // Flatten any nested marks.
  const marks = options.marks === undefined ? [] : options.marks.flat(Infinity).map(markify);

  // Compute the top-level facet state. This has roughly the same structure as
  // mark-specific facet state, except there isn’t a facetsIndex, and there’s a
  // data and dataLength so we can warn the user if a different data of the same
  // length is used in a mark.
  const topFacetState = maybeTopFacet(facet);

  // Construct a map from (faceted) Mark instance to facet state, including:
  // fx - a channel to add to the fx scale
  // fy - a channel to add to the fy scale
  // groups - a possibly-nested map from facet values to indexes in the data array
  // facetsIndex - a nested array of indices corresponding to the valid facets
  const facetStateByMark = new Map();
  for (const mark of marks) {
    const facetState = maybeMarkFacet(mark, topFacetState);
    if (facetState) facetStateByMark.set(mark, facetState);
  }

  // Const a Map from scale name to an array of associated channels, but only
  // for the fx and fy scales and channels, which are evaluated specially.
  const facetChannelsByScale = new Map();
  if (topFacetState) addFacetChannels(facetChannelsByScale, topFacetState);
  for (const facetState of facetStateByMark.values()) addFacetChannels(facetChannelsByScale, facetState);

  // Construct the initial facet scales.
  const facetScaleDescriptors = Scales(facetChannelsByScale, options);
  const facetScales = ScaleFunctions(facetScaleDescriptors);
  let {fx, fy} = facetScales;

  // All the possible facets are given by the domains of fx or fy, or the
  // cross-product of these domains if we facet by both x and y. We sort them in
  // order to apply the facet filters afterwards.
  let fxDomain = fx?.domain();
  let fyDomain = fy?.domain();
  let facets =
    fxDomain && fyDomain
      ? cross(sort(fxDomain, ascending), sort(fyDomain, ascending)).map(([x, y]) => ({x, y}))
      : fxDomain
      ? sort(fxDomain, ascending).map((x) => ({x}))
      : fyDomain
      ? sort(fyDomain, ascending).map((y) => ({y}))
      : undefined;

  if (facets !== undefined) {
    const facetsIndex = topFacetState ? filterFacets(facets, topFacetState) : undefined;

    // Compute a facet index for each mark, parallel to the facets array.
    for (const mark of marks) {
      const {facet} = mark;
      if (facet === null) continue;
      const facetInfo = facetStateByMark.get(mark);
      if (facetInfo === undefined) continue;

      // For mark-level facets, compute an index for that mark’s data and options.
      const {fx, fy} = mark;
      if (fx !== undefined || fy !== undefined) {
        facetInfo.facetsIndex = filterFacets(facets, facetInfo);
      }

      // Otherwise, link to the top-level facet information.
      else if (topFacetState !== undefined) {
        facetInfo.facetsIndex = facetsIndex;
        const {fx, fy} = topFacetState;
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
    for (const {facetsIndex} of facetStateByMark.values()) {
      if (facetsIndex) {
        facetsIndex.forEach((index, i) => {
          if (index?.length > 0) nonEmpty.add(i);
        });
      }
    }
    if (0 < nonEmpty.size && nonEmpty.size < facets.length) {
      facets = facets.filter((_, i) => nonEmpty.has(i));
      for (const state of facetStateByMark.values()) {
        const {facetsIndex} = state;
        if (!facetsIndex) continue;
        state.facetsIndex = facetsIndex.filter((_, i) => nonEmpty.has(i));
      }
    }
  }

  // A Map from scale name to an array of associated (non-facet) channels.
  const channelsByScale = new Map();

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
    const facetState = facetStateByMark.get(mark) || {};
    const facetsIndex = mark.facet === "exclude" ? excludeIndex(facetState.facetsIndex) : facetState.facetsIndex;
    const {data, facets, channels} = mark.initialize(facetsIndex, facetState); // TODO Only pass {fx, fy}, not all facetState.
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, {data, facets, channels});
  }

  // TODO Don’t initialize the fx and fy scales twice.
  for (const [key, channels] of facetChannelsByScale) channelsByScale.set(key, channels);

  // Initalize the scales.
  const scaleDescriptors = Scales(addScaleChannels(channelsByScale, stateByMark), options);
  const scales = ScaleFunctions(scaleDescriptors);

  // TODO Don’t initialize the fx and fy scales twice.
  ({fx, fy} = scales);
  fxDomain = fx?.domain();
  fyDomain = fy?.domain();

  // Merge the non-facet scales with the previously-computed facet scales.
  // Object.assign(scaleDescriptors, facetScaleDescriptors);
  // Object.assign(scales, facetScales);

  // Intialize the axes.
  const axes = Axes(scaleDescriptors, options);
  const dimensions = Dimensions(scaleDescriptors, hasGeometry(stateByMark), axes, options);

  autoScaleRange(scaleDescriptors, dimensions);
  autoAxisTicks(scaleDescriptors, axes);

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
    for (const key of newByScale) {
      if (scaleRegistry.get(key) === position) {
        throw new Error(`initializers cannot declare position scales: ${key}`);
      }
    }
    const newScaleDescriptors = Scales(
      addScaleChannels(new Map(), stateByMark, (key) => newByScale.has(key)),
      options
    );
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }

  // TODO Pass facetChannelsByScale here, separately?
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
        addMapValue(channelsByScale, scale, channel);
      }
    }
  }
  return channelsByScale;
}

function addFacetChannels(channelsByScale, facetState) {
  const {fx, fy} = facetState;
  if (fx) addMapValue(channelsByScale, "fx", fx);
  if (fy) addMapValue(channelsByScale, "fy", fy);
}

function addMapValue(map, key, value) {
  const values = map.get(key);
  if (values !== undefined) values.push(value);
  else map.set(key, [value]);
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

// Returns keys in order of the associated scale’s domains.
function facetKeys(facets, {fx, fy}) {
  const fxI = fx && new Map(fx.domain().map((x, i) => [x, i]));
  const fyI = fy && new Map(fy.domain().map((y, i) => [y, i]));
  return sort(
    facets,
    ({x: xa, y: ya}, {x: xb, y: yb}) => (fxI && fxI.get(xa) - fxI.get(xb)) || (fyI && fyI.get(ya) - fyI.get(yb))
  );
}

// Returns a (possibly nested) Map of [[key1, index1], [key2, index2], …]
// representing the data indexes associated with each facet.
function facetGroups(data, fx, fy) {
  const index = range(data);
  return fx && fy ? facetGroup2(index, fx, fy) : fx ? facetGroup1(index, fx) : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return group(index, (i) => F[i]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
  return group(
    index,
    (i) => FX[i],
    (i) => FY[i]
  );
}

function facetTranslate(fx, fy) {
  return fx && fy
    ? ({x, y}) => `translate(${fx(x)},${fy(y)})`
    : fx
    ? ({x}) => `translate(${fx(x)},0)`
    : ({y}) => `translate(0,${fy(y)})`;
}

// Returns an index that for each facet lists all the elements present in other
// facets in the original index.
function excludeIndex(index) {
  const ex = [];
  const e = new Uint32Array(sum(index, (d) => d.length));
  for (const i of index) {
    let n = 0;
    for (const j of index) {
      if (i === j) continue;
      e.set(j, n);
      n += j.length;
    }
    ex.push(e.slice(0, n));
  }
  return ex;
}

// Returns the facet groups, and possibly fx and fy channels, associated with
// the top-level facet option {data, x, y}.
function maybeTopFacet(facet) {
  if (facet == null) return;
  const {x, y} = facet;
  if (x == null && y == null) return;
  const data = arrayify(facet.data);
  if (data == null) throw new Error(`missing facet data`);
  // TODO Call applyScaleTransforms on the fx and fy channels.
  const fx = x != null ? Channel(data, {value: x, scale: "fx"}) : undefined;
  const fy = y != null ? Channel(data, {value: y, scale: "fy"}) : undefined;
  const groups = facetGroups(data, fx, fy);
  // If the top-level faceting is non-trivial, track the corresponding data
  // length, in order to compare it for the warning above.
  const dataLength =
    groups.size > 1 || (fx && fy && groups.size === 1 && [...groups][0][1].size > 1) ? data.length : undefined;
  return {fx, fy, groups, data: facet.data, dataLength};
}

// Returns the facet groups, and possibly fx and fy channels, associated with a
// mark, either through top-level faceting or mark-level facet options {fx, fy}.
function maybeMarkFacet(mark, topFacetState) {
  if (mark.facet === null) return;

  // This mark defines a mark-level facet.
  const {fx: x, fy: y} = mark;
  if (x != null || y != null) {
    const data = arrayify(mark.data);
    if (data == null) throw new Error(`missing facet data in ${mark.ariaLabel}`);
    // TODO Call applyScaleTransforms on the fx and fy channels.
    const fx = x != null ? Channel(data, {value: x, scale: "fx"}) : undefined;
    const fy = y != null ? Channel(data, {value: y, scale: "fy"}) : undefined;
    return {fx, fy, groups: facetGroups(data, fx, fy)};
  }

  // This mark links to a top-level facet, if present.
  if (topFacetState === undefined) return;

  const {groups, data, dataLength} = topFacetState;
  if (mark.facet !== "auto" || mark.data === data) return {groups};

  // Warn for the common pitfall of wanting to facet mapped data. See above for
  // the initialization of dataLength.
  if (dataLength !== undefined && arrayify(mark.data)?.length === dataLength) {
    warn(
      `Warning: the ${mark.ariaLabel} mark appears to use faceted data, but isn’t faceted. The mark data has the same length as the facet data and the mark facet option is "auto", but the mark data and facet data are distinct. If this mark should be faceted, set the mark facet option to true; otherwise, suppress this warning by setting the mark facet option to false.`
    );
  }
}

// Facet filter, by mark; for now only the "eq" filter is provided.
function filterFacets(facets, {fx, fy}) {
  const X = fx != null && fx.value;
  const Y = fy != null && fy.value;
  const index = range(X || Y);
  const gx = X && group(index, (i) => X[i]);
  const gy = Y && group(index, (i) => Y[i]);
  return X && Y
    ? facets.map(({x, y}) => arrayify(intersection(gx.get(x) ?? [], gy.get(y) ?? [])))
    : X
    ? facets.map(({x}) => gx.get(x) ?? [])
    : facets.map(({y}) => gy.get(y) ?? []);
}
