import {blur2, contours, geoPath, map, max, min, nice, range, ticks, thresholdSturges} from "d3";
import {Channels} from "../channel.js";
import {create} from "../context.js";
import {labelof, identity, arrayify} from "../options.js";
import {Position} from "../projection.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, styles} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {maybeThresholds} from "../transforms/bin.js";
import {AbstractRaster, maybeTuples, rasterBounds, sampler} from "./raster.js";

const defaults = {
  ariaLabel: "contour",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1,
  pixelSize: 2
};

export class Contour extends AbstractRaster {
  constructor(data, {smooth = true, value, ...options} = {}) {
    const channels = styles({}, options, defaults);

    // If value is not specified explicitly, look for a channel to promote. If
    // more than one channel is present, throw an error. (To disambiguate,
    // specify the value option explicitly.)
    if (value === undefined) {
      for (const key in channels) {
        if (channels[key].value != null) {
          if (value !== undefined) throw new Error("ambiguous contour value");
          value = options[key];
          options[key] = "value";
        }
      }
    }

    // For any channel specified as the literal (contour threshold) "value"
    // (maybe because of the promotion above), propagate the label from the
    // original value definition.
    if (value != null) {
      const v = {transform: (D) => D.map((d) => d.value), label: labelof(value)};
      for (const key in channels) {
        if (options[key] === "value") {
          options[key] = v;
        }
      }
    }

    // If the data is null, then we’ll construct the raster grid by evaluating a
    // function for each point in a dense grid. The value channel is populated
    // by the sampler initializer, and hence is not passed to super to avoid
    // computing it before there’s data.
    if (data == null) {
      if (value == null) throw new Error("missing contour value");
      options = sampler("value", {value, ...options});
      value = null;
    }

    // Otherwise if data was provided, it represents a discrete set of spatial
    // samples (often a grid, but not necessarily). If no interpolation method
    // was specified, default to nearest.
    else {
      let {interpolate} = options;
      if (value === undefined) value = identity;
      if (interpolate === undefined) options.interpolate = "nearest";
    }

    // Wrap the options in our initializer that computes the contour geometries;
    // this runs after any other initializers (and transforms).
    super(data, {value: {value, optional: true}}, contourGeometry(options), defaults);

    // With the exception of the x, y, x1, y1, x2, y2, and value channels, this
    // mark’s channels are not evaluated on the initial data but rather on the
    // contour multipolygons generated in the initializer.
    const contourChannels = {geometry: {value: identity}};
    for (const key in this.channels) {
      const channel = this.channels[key];
      const {scale} = channel;
      if (scale === "x" || scale === "y" || key === "value") continue;
      contourChannels[key] = channel;
      delete this.channels[key];
    }
    this.contourChannels = contourChannels;
    this.smooth = !!smooth;
  }
  filter(index, {x, y, value, ...channels}, values) {
    // Only filter channels constructed by the contourGeometry initializer; the
    // x, y, and value channels must be filtered by the initializer itself.
    return super.filter(index, channels, values);
  }
  render(index, scales, channels, dimensions, context) {
    const {geometry: G} = channels;
    const path = geoPath();
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) => {
        g.selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", (i) => path(G[i]))
          .call(applyChannelStyles, this, channels);
      })
      .node();
  }
}

function contourGeometry({thresholds, interval, ...options}) {
  thresholds = maybeThresholds(thresholds, interval, thresholdSturges);
  return initializer(options, function (data, facets, channels, scales, dimensions, context) {
    const [x1, y1, x2, y2] = rasterBounds(channels, scales, dimensions, context);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const {pixelSize: k, width: w = Math.round(Math.abs(dx) / k), height: h = Math.round(Math.abs(dy) / k)} = this;
    const kx = w / dx;
    const ky = h / dy;
    const V = channels.value.value;
    const VV = []; // V per facet

    // Interpolate the raster grid, as needed.
    if (this.interpolate) {
      const {x: X, y: Y} = Position(channels, scales, context);
      // Convert scaled (screen) coordinates to grid (canvas) coordinates.
      const IX = map(X, (x) => (x - x1) * kx, Float64Array);
      const IY = map(Y, (y) => (y - y1) * ky, Float64Array);
      // The contour mark normally skips filtering on x, y, and value, so here
      // we’re careful to use different names (0, 1, 2) when filtering.
      const ichannels = [channels.x, channels.y, channels.value];
      const ivalues = [IX, IY, V];
      for (const facet of facets) {
        const index = this.filter(facet, ichannels, ivalues);
        VV.push(this.interpolate(index, w, h, IX, IY, V));
      }
    }

    // Otherwise, chop up the existing dense raster grid into facets, if needed.
    // V must be a dense grid in projected coordinates; if there are multiple
    // facets, then V must be laid out vertically as facet 0, 1, 2… etc.
    else if (facets) {
      const n = w * h;
      const m = facets.length;
      for (let i = 0; i < m; ++i) VV.push(V.slice(i * n, i * n + n));
    } else {
      VV.push(V);
    }

    // Blur the raster grid, if desired.
    if (this.blur > 0) for (const V of VV) blur2({data: V, width: w, height: h}, this.blur);

    // Compute the contour thresholds.
    const T = maybeTicks(thresholds, V, ...finiteExtent(VV));
    if (T === null) throw new Error(`unsupported thresholds: ${thresholds}`);

    // Compute the (maybe faceted) contours.
    const {contour} = contours().size([w, h]).smooth(this.smooth);
    const contourData = [];
    const contourFacets = [];
    for (const V of VV) contourFacets.push(range(contourData.length, contourData.push(...T.map((t) => contour(V, t)))));

    // Rescale the contour multipolygon from grid to screen coordinates.
    for (const {coordinates} of contourData) {
      for (const rings of coordinates) {
        for (const ring of rings) {
          for (const point of ring) {
            point[0] = point[0] / kx + x1;
            point[1] = point[1] / ky + y1;
          }
        }
      }
    }

    // Compute the deferred channels.
    return {
      data: contourData,
      facets: contourFacets,
      channels: Channels(this.contourChannels, contourData)
    };
  });
}

// Apply the thresholds interval, function, or count, and return an array of
// ticks. d3-contour unlike d3-array doesn’t pass the min and max automatically,
// so we do that here to normalize, and also so we can share consistent
// thresholds across facets. When an interval is used, note that the lowest
// threshold should be below (or equal) to the lowest value, or else some data
// will be missing.
function maybeTicks(thresholds, V, min, max) {
  if (typeof thresholds?.range === "function") return thresholds.range(thresholds.floor(min), max);
  if (typeof thresholds === "function") thresholds = thresholds(V, min, max);
  if (typeof thresholds !== "number") return arrayify(thresholds, Array);
  const tz = ticks(...nice(min, max, thresholds), thresholds);
  while (tz[tz.length - 1] >= max) tz.pop();
  while (tz[1] < min) tz.shift();
  return tz;
}

/** @jsdoc contour */
export function contour() {
  return new Contour(...maybeTuples("value", ...arguments));
}

function finiteExtent(VV) {
  return [min(VV, (V) => min(V, finite)), max(VV, (V) => max(V, finite))];
}

function finite(x) {
  return isFinite(x) ? x : NaN;
}
