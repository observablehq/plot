import {cross, difference, groups, InternMap, select} from "d3";
import {Axes, autoAxisTicks, autoScaleLabels} from "./axes.js";
import {Channel, Channels, channelDomain, valueObject} from "./channel.js";
import {Context, create} from "./context.js";
import {defined} from "./defined.js";
import {Dimensions} from "./dimensions.js";
import {Legends, exposeLegends} from "./legends.js";
import {
  arrayify,
  isDomainSort,
  isScaleOptions,
  keyword,
  map,
  maybeNamed,
  range,
  second,
  where,
  yes
} from "./options.js";
import {Scales, ScaleFunctions, autoScaleRange, exposeScales} from "./scales.js";
import {position, registry as scaleRegistry} from "./scales/index.js";
import {applyInlineStyles, maybeClassName, maybeClip, styles} from "./style.js";
import {basic, initializer} from "./transforms/basic.js";
import {maybeInterval} from "./transforms/interval.js";
import {consumeWarnings, warn} from "./warnings.js";

/**
 * Renders a new plot given the specified *options* and returns the
 * corresponding SVG or HTML figure element. All *options* are optional.
 *
 * ### Mark options
 *
 * The **marks** option specifies an array of
 * [marks](https://github.com/observablehq/plot/blob/main/README.md#marks) to
 * render. Each mark has its own data and options; see the respective mark type
 * (*e.g.*, [bar](https://github.com/observablehq/plot/blob/main/README.md#bar)
 * or [dot](https://github.com/observablehq/plot/blob/main/README.md#dot)) for
 * which mark options are supported. Each mark may be a nested array of marks,
 * allowing composition. Marks may also be a function which returns an SVG
 * element, if you wish to insert some arbitrary content into your plot. And
 * marks may be null or undefined, which produce no output; this is useful for
 * showing marks conditionally (*e.g.*, when a box is checked). Marks are drawn
 * in *z* order, last on top. For example, here a single rule at *y* = 0 is
 * drawn on top of blue bars for the [*alphabet*
 * dataset](https://github.com/observablehq/plot/blob/main/test/data/alphabet.csv).
 *
 * ```js
 * Plot.plot({
 *   marks: [
 *     Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "steelblue"}),
 *     Plot.ruleY([0])
 *   ]
 * })
 * ```
 *
 * ### Layout options
 *
 * These options determine the overall layout of the plot; all are specified as
 * numbers in pixels:
 *
 * * **marginTop** - the top margin
 * * **marginRight** - the right margin
 * * **marginBottom** - the bottom margin
 * * **marginLeft** - the left margin
 * * **margin** - shorthand for the four margins
 * * **width** - the outer width of the plot (including margins)
 * * **height** - the outer height of the plot (including margins)
 *
 * The default **width** is 640. On Observable, the width can be set to the
 * [standard
 * width](https://github.com/observablehq/stdlib/blob/main/README.md#width) to
 * make responsive plots. The default **height** is chosen automatically based
 * on the plot’s associated scales; for example, if *y* is linear and there is
 * no *fy* scale, it might be 396.
 *
 * The default margins depend on the plot’s axes: for example, **marginTop** and
 * **marginBottom** are at least 30 if there is a corresponding top or bottom
 * *x* axis, and **marginLeft** and **marginRight** are at least 40 if there is
 * a corresponding left or right *y* axis. For simplicity’s sake and for
 * consistent layout across plots, margins are not automatically sized to make
 * room for tick labels; instead, shorten your tick labels or increase the
 * margins as needed. (In the future, margins may be specified indirectly via a
 * scale property to make it easier to reorient axes without adjusting margins;
 * see [#210](https://github.com/observablehq/plot/issues/210).)
 *
 * The **style** option allows custom styles to override Plot’s defaults. It may
 * be specified either as a string of inline styles (*e.g.*, `"color: red;"`, in
 * the same fashion as assigning
 * [*element*.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style))
 * or an object of properties (*e.g.*, `{color: "red"}`, in the same fashion as
 * assigning [*element*.style
 * properties](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)).
 * Note that unitless numbers ([quirky
 * lengths](https://www.w3.org/TR/css-values-4/#deprecated-quirky-length)) such
 * as `{padding: 20}` may not supported by some browsers; you should instead
 * specify a string with units such as `{padding: "20px"}`. By default, the
 * returned plot has a white background, a max-width of 100%, and the system-ui
 * font. Plot’s marks and axes default to
 * [currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword),
 * meaning that they will inherit the surrounding content’s color. For example,
 * a dark theme:
 *
 * ```js
 * Plot.plot({
 *   marks: …,
 *   style: {
 *     background: "black",
 *     color: "white"
 *   }
 * })
 * ```
 *
 * If a **caption** is specified, Plot.plot wraps the generated SVG element in
 * an HTML figure element with a figcaption, returning the figure. To specify an
 * HTML caption, consider using the [`html` tagged template
 * literal](http://github.com/observablehq/htl); otherwise, the specified string
 * represents text that will be escaped as needed.
 *
 * ```js
 * Plot.plot({
 *   marks: …,
 *   caption: html`Figure 1. This chart has a <i>fancy</i> caption.`
 * })
 * ```
 *
 * The generated SVG element has a random class name which applies a default
 * stylesheet. Use the top-level **className** option to specify that class
 * name.
 *
 * The **document** option specifies the
 * [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) used to
 * create plot elements. It defaults to window.document, but can be changed to
 * another document, say when using a virtual DOM library for server-side
 * rendering in Node.
 *
 * ### Scale options
 *
 * Plot passes data through
 * [scales](https://observablehq.com/@observablehq/plot-scales) as needed before
 * rendering marks. A scale maps abstract values such as time or temperature to
 * visual values such as position or color. Within a given plot, marks share
 * scales. For example, if a plot has two Plot.line marks, both share the same
 * *x* and *y* scales for a consistent representation of data. (Plot does not
 * currently support dual-axis charts, which are [not
 * advised](https://blog.datawrapper.de/dualaxis/).)
 *
 * ```js
 * Plot.plot({
 *   marks: [
 *     Plot.line(aapl, {x: "Date", y: "Close"}),
 *     Plot.line(goog, {x: "Date", y: "Close"})
 *   ]
 * })
 * ```
 *
 * Each scale’s options are specified as a nested options object with the
 * corresponding scale name within the top-level plot *options*:
 *
 * * **x** - horizontal position
 * * **y** - vertical position
 * * **r** - radius (size)
 * * **color** - fill or stroke
 * * **opacity** - fill or stroke opacity
 * * **length** - linear length (for
 *   [vectors](https://github.com/observablehq/plot/blob/main/README.md#vector))
 * * **symbol** - categorical symbol (for
 *   [dots](https://github.com/observablehq/plot/blob/main/README.md#dot))
 *
 * For example, to set the domain for the *x* and *y* scales:
 *
 * ```js
 * Plot.plot({
 *   x: {
 *     domain: [new Date("1880-01-01"), new Date("2016-11-01")]
 *   },
 *   y: {
 *     domain: [-0.78, 1.35]
 *   }
 * })
 * ```
 *
 * Plot supports many scale types. Some scale types are for quantitative data:
 * values that can be added or subtracted, such as temperature or time. Other
 * scale types are for ordinal or categorical data: unquantifiable values that
 * can only be ordered, such as t-shirt sizes, or values with no inherent order
 * that can only be tested for equality, such as types of fruit. Some scale
 * types are further intended for specific visual encodings: for example, as
 * [position](https://github.com/observablehq/plot/blob/main/README.md#position-options)
 * or
 * [color](https://github.com/observablehq/plot/blob/main/README.md#color-options).
 *
 * You can set the scale type explicitly via the *scale*.**type** option, though
 * typically the scale type is inferred automatically. Some marks mandate a
 * particular scale type: for example,
 * [Plot.barY](https://github.com/observablehq/plot/blob/main/README.md#plotbarydata-options)
 * requires that the *x* scale is a *band* scale. Some scales have a default
 * type: for example, the *radius* scale defaults to *sqrt* and the *opacity*
 * scale defaults to *linear*. Most often, the scale type is inferred from
 * associated data, pulled either from the domain (if specified) or from
 * associated channels. A *color* scale defaults to *identity* if no range or
 * scheme is specified and all associated defined values are valid CSS color
 * strings. Otherwise, strings and booleans imply an ordinal scale; dates imply
 * a UTC scale; and anything else is linear. Unless they represent text, we
 * recommend explicitly converting strings to more specific types when loading
 * data (*e.g.*, with d3.autoType or Observable’s FileAttachment). For
 * simplicity’s sake, Plot assumes that data is consistently typed; type
 * inference is based solely on the first non-null, non-undefined value.
 *
 * For quantitative data (*i.e.* numbers), a mathematical transform may be
 * applied to the data by changing the scale type:
 *
 * * *linear* (default) - linear transform (translate and scale)
 * * *pow* - power (exponential) transform
 * * *sqrt* - square-root transform (*pow* transform with exponent = 0.5)
 * * *log* - logarithmic transform
 * * *symlog* - bi-symmetric logarithmic transform per [Webber *et
 *   al.*](https://www.researchgate.net/publication/233967063_A_bi-symmetric_log_transformation_for_wide-range_data)
 *
 * The appropriate transform depends on the data’s distribution and what you
 * wish to know. A *sqrt* transform exaggerates differences between small values
 * at the expense of large values; it is a special case of the *pow* transform
 * which has a configurable *scale*.**exponent** (0.5 for *sqrt*). A *log*
 * transform is suitable for comparing orders of magnitude and can only be used
 * when the domain does not include zero. The base defaults to 10 and can be
 * specified with the *scale*.**base** option; note that this only affects the
 * axis ticks and not the scale’s behavior. A *symlog* transform is more
 * elaborate, but works well with wide-range values that include zero; it can be
 * configured with the *scale*.**constant** option (default 1).
 *
 * For temporal data (*i.e.* dates), two variants of a *linear* scale are also
 * supported:
 *
 * * *utc* (default, recommended) - UTC time
 * * *time* - local time
 *
 * UTC is recommended over local time as charts in UTC time are guaranteed to
 * appear consistently to all viewers whereas charts in local time will depend
 * on the viewer’s time zone. Due to limitations in JavaScript’s Date class,
 * Plot does not yet support an explicit time zone other than UTC.
 *
 * For ordinal data (*e.g.*, strings), use the *ordinal* scale type or the
 * *point* or *band* [position scale
 * types](https://github.com/observablehq/plot/blob/main/README.md#position-options).
 * The *categorical* scale type is also supported; it is equivalent to *ordinal*
 * except as a [color
 * scale](https://github.com/observablehq/plot/blob/main/README.md#color-options),
 * where it provides a different default color scheme. (Since position is
 * inherently ordinal or even quantitative, categorical data must be assigned an
 * effective order when represented as position, and hence *categorical* and
 * *ordinal* may be considered synonymous in context.)
 *
 * You can opt-out of a scale using the *identity* scale type. This is useful if
 * you wish to specify literal colors or pixel positions within a mark channel
 * rather than relying on the scale to convert abstract values into visual
 * values. For position scales (*x* and *y*), an *identity* scale is still
 * quantitative and may produce an axis, yet unlike a *linear* scale the domain
 * and range are fixed based on the plot layout.
 *
 * Quantitative scales, as well as identity position scales, coerce channel
 * values to numbers; both null and undefined are coerced to NaN. Similarly,
 * time scales coerce channel values to dates; numbers are assumed to be
 * milliseconds since UNIX epoch, while strings are assumed to be in [ISO 8601
 * format](https://github.com/mbostock/isoformat/blob/main/README.md#parsedate-fallback).
 *
 * A scale’s domain (the extent of its inputs, abstract values) and range (the
 * extent of its outputs, visual values) are typically inferred automatically.
 * You can set them explicitly using these options:
 *
 * * *scale*.**domain** - typically [*min*, *max*], or an array of ordinal or
 *   categorical values
 * * *scale*.**range** - typically [*min*, *max*], or an array of ordinal or
 *   categorical values
 * * *scale*.**unknown** - the desired output value (defaults to undefined) for
 *   invalid input values
 * * *scale*.**reverse** - reverses the domain (or in somes cases, the range),
 *   say to flip the chart along *x* or *y*
 * * *scale*.**interval** - an interval or time interval (for interval data; see
 *   below)
 *
 * For most quantitative scales, the default domain is the [*min*, *max*] of all
 * values associated with the scale. For the *radius* and *opacity* scales, the
 * default domain is [0, *max*] to ensure a meaningful value encoding. For
 * ordinal scales, the default domain is the set of all distinct values
 * associated with the scale in natural ascending order; for a different order,
 * set the domain explicitly or add a [sort
 * option](https://github.com/observablehq/plot/blob/main/README.md#sort-options)
 * to an associated mark. For threshold scales, the default domain is [0] to
 * separate negative and non-negative values. For quantile scales, the default
 * domain is the set of all defined values associated with the scale. If a scale
 * is reversed, it is equivalent to setting the domain as [*max*, *min*] instead
 * of [*min*, *max*].
 *
 * The default range depends on the scale: for [position
 * scales](https://github.com/observablehq/plot/blob/main/README.md#position-options)
 * (*x*, *y*, *fx*, and *fy*), the default range depends on the plot’s [size and
 * margins](https://github.com/observablehq/plot/blob/main/README.md#layout-options).
 * For [color
 * scales](https://github.com/observablehq/plot/blob/main/README.md#color-options),
 * there are default color schemes for quantitative, ordinal, and categorical
 * data. For opacity, the default range is [0, 1]. And for radius, the default
 * range is designed to produce dots of “reasonable” size assuming a *sqrt*
 * scale type for accurate area representation: zero maps to zero, the first
 * quartile maps to a radius of three pixels, and other values are extrapolated.
 * This convention for radius ensures that if the scale’s data values are all
 * equal, dots have the default constant radius of three pixels, while if the
 * data varies, dots will tend to be larger.
 *
 * The behavior of the *scale*.**unknown** option depends on the scale type. For
 * quantitative and temporal scales, the unknown value is used whenever the
 * input value is undefined, null, or NaN. For ordinal or categorical scales,
 * the unknown value is returned for any input value outside the domain. For
 * band or point scales, the unknown option has no effect; it is effectively
 * always equal to undefined. If the unknown option is set to undefined (the
 * default), or null or NaN, then the affected input values will be considered
 * undefined and filtered from the output.
 *
 * For data at regular intervals, such as integer values or daily samples, the
 * *scale*.**interval** option can be used to enforce uniformity. The specified
 * *interval*—such as d3.utcMonth—must expose an *interval*.floor(*value*),
 * *interval*.offset(*value*), and *interval*.range(*start*, *stop*) functions.
 * The option can also be specified as a number, in which case it will be
 * promoted to a numeric interval with the given step. This option sets the
 * default *scale*.transform to the given interval’s *interval*.floor function.
 * In addition, the default *scale*.domain is an array of uniformly-spaced
 * values spanning the extent of the values associated with the scale.
 *
 * Quantitative scales can be further customized with additional options:
 *
 * * *scale*.**clamp** - if true, clamp input values to the scale’s domain
 * * *scale*.**nice** - if true (or a tick count), extend the domain to nice
 *   round values
 * * *scale*.**zero** - if true, extend the domain to include zero if needed
 * * *scale*.**percent** - if true, transform proportions in [0, 1] to
 *   percentages in [0, 100]
 *
 * Clamping is typically used in conjunction with setting an explicit domain
 * since if the domain is inferred, no values will be outside the domain.
 * Clamping is useful for focusing on a subset of the data while ensuring that
 * extreme values remain visible, but use caution: clamped values may need an
 * annotation to avoid misinterpretation. Top-level **clamp**, **nice**, and
 * **zero** options are supported as shorthand for setting the respective option
 * on all scales.
 *
 * The *scale*.**transform** option allows you to apply a function to all values
 * before they are passed through the scale. This is convenient for transforming
 * a scale’s data, say to convert to thousands or between temperature units.
 *
 * ```js
 * Plot.plot({
 *   y: {
 *     label: "↑ Temperature (°F)",
 *     transform: f => f * 9 / 5 + 32 // convert Celsius to Fahrenheit
 *   },
 *   marks: …
 * })
 * ```
 *
 * #### *plot*.scale(*scaleName*)
 *
 * Scale definitions can be exposed through the *plot*.**scale**(*scaleName*)
 * function of a returned plot. The *scaleName* must be one of the known scale
 * names: `"x"`, `"y"`, `"fx"`, `"fy"`, `"r"`, `"color"`, `"opacity"`,
 * `"symbol"`, or `"length"`. If the associated *plot* has no scale with the
 * given *scaleName*, returns undefined.
 *
 * ```js
 * const plot = Plot.plot(…); // render a plot
 * const color = plot.scale("color"); // retrieve the color scale object
 * console.log(color.range); // inspect the color scale’s range, ["red", "blue"]
 * ```
 */
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
  let facetData;
  if (facet !== undefined) {
    const {x, y} = facet;
    if (x != null || y != null) {
      facetData = arrayify(facet.data);
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
    const markFacets =
      facetsIndex === undefined
        ? undefined
        : mark.facet === "auto"
        ? mark.data === facet.data
          ? facetsIndex
          : undefined
        : mark.facet === "include"
        ? facetsIndex
        : mark.facet === "exclude"
        ? facetsExclude || (facetsExclude = facetsIndex.map((f) => Uint32Array.from(difference(facetIndex, f))))
        : undefined;
    const {data, facets, channels} = mark.initialize(markFacets, facetChannels);
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, {data, facets, channels});

    // Warn for the common pitfall of wanting to facet mapped data.
    if (
      facetIndex?.length > 1 && // non-trivial faceting
      mark.facet === "auto" && // no explicit mark facet option
      mark.data !== facet.data && // mark not implicitly faceted (different data)
      arrayify(mark.data)?.length === facetData.length // mark data seems parallel to facet data
    ) {
      warn(
        `Warning: the ${mark.ariaLabel} mark appears to use faceted data, but isn’t faceted. The mark data has the same length as the facet data and the mark facet option is "auto", but the mark data and facet data are distinct. If this mark should be faceted, set the mark facet option to true; otherwise, suppress this warning by setting the mark facet option to false.`
      );
    }
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
    const indexByFacet = facetMap(facetChannels);
    facets.forEach(([key], i) => indexByFacet.set(key, i));
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
      selection
        .selectAll()
        .data(fyDomain)
        .enter()
        .append((ky, i) =>
          (i === j ? axis1 : axis2).render(
            fx && where(fxDomain, (kx) => indexByFacet.has([kx, ky])),
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
      const {marginLeft, marginRight} = dimensions;
      selection
        .selectAll()
        .data(fxDomain)
        .enter()
        .append((kx, i) =>
          (i === j ? axis1 : axis2).render(
            fy && where(fyDomain, (ky) => indexByFacet.has([kx, ky])),
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
    selection
      .selectAll()
      .data(facetKeys(scales).filter(indexByFacet.has, indexByFacet))
      .enter()
      .append("g")
      .attr("aria-label", "facet")
      .attr("transform", facetTranslate(fx, fy))
      .each(function (key) {
        const j = indexByFacet.get(key);
        for (const [mark, {channels, values, facets}] of stateByMark) {
          const facet = facets ? mark.filter(facets[j] ?? facets[0], channels, values) : null;
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
    const {facet = "auto", sort, dx, dy, clip, channels: extraChannels} = options;
    this.data = data;
    this.sort = isDomainSort(sort) ? sort : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    this.facet =
      facet == null || facet === false
        ? null
        : keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
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

/**
 * A convenience method for composing a mark from a series of other marks.
 * Returns an array of marks that implements the *mark*.plot function. See the
 * [box mark
 * implementation](https://github.com/observablehq/plot/blob/main/src/marks/box.js)
 * for an example.
 */
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

// Derives a copy of the specified axis with the label disabled.
function nolabel(axis) {
  return axis === undefined || axis.label === undefined
    ? axis // use the existing axis if unlabeled
    : Object.assign(Object.create(axis), {label: undefined});
}

// Unlike facetGroups, which returns groups in order of input data, this returns
// keys in order of the associated scale’s domains.
function facetKeys({fx, fy}) {
  return fx && fy ? cross(fx.domain(), fy.domain()) : fx ? fx.domain() : fy.domain();
}

// Returns an array of [[key1, index1], [key2, index2], …] representing the data
// indexes associated with each facet. For two-dimensional faceting, each key
// is a two-element array; see also facetMap.
function facetGroups(index, {fx, fy}) {
  return fx && fy ? facetGroup2(index, fx, fy) : fx ? facetGroup1(index, fx) : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return groups(index, (i) => F[i]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
  return groups(
    index,
    (i) => FX[i],
    (i) => FY[i]
  ).flatMap(([x, xgroup]) => xgroup.map(([y, ygroup]) => [[x, y], ygroup]));
}

// This must match the key structure returned by facetGroups.
function facetTranslate(fx, fy) {
  return fx && fy
    ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx
    ? (kx) => `translate(${fx(kx)},0)`
    : (ky) => `translate(0,${fy(ky)})`;
}

function facetMap({fx, fy}) {
  return new (fx && fy ? FacetMap2 : FacetMap)();
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
