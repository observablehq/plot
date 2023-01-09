import {blur2, contours, geoPath, map, thresholdSturges} from "d3";
import {Channels} from "../channel.js";
import {create} from "../context.js";
import {labelof, range, identity} from "../options.js";
import {Position} from "../projection.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, styles} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {sampler, maybeTuples, AbstractRaster, framer} from "./raster.js";

const defaults = {
  ariaLabel: "contour",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1,
  pixelSize: 2
};

export class Contour extends AbstractRaster {
  constructor(data, {value, ...options} = {}) {
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
    if (value !== undefined) {
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
      if (typeof value !== "function") throw new Error("invalid contour value");
      options = sampler("value", {value, ...options});
      value = null;
    }

    // Otherwise if data was provided, it represents a discrete set of spatial
    // samples (often a grid, but not necessarily). If no interpolation method
    // was specified, and the input points have x and y positions and thus are
    // not likely to be a dense grid, default to barycentric.
    else {
      let {x, y, interpolate} = options;
      if (value === undefined) value = identity;
      if (interpolate === undefined && x != null && y != null) options.interpolate = "barycentric";
      options = framer(options);
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

function contourGeometry(options) {
  const {thresholds = thresholdSturges} = options; // TODO thresholdAuto; match density mark
  return initializer(options, function (data, facets, channels, scales, dimensions, context) {
    let {x1, y1, x2, y2} = channels;
    ({x: [x1], y: [y1]} = Position({x: x1, y: y1}, scales, context)); // prettier-ignore
    ({x: [x2], y: [y2]} = Position({x: x2, y: y2}, scales, context)); // prettier-ignore
    let V = channels.value.value;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const {pixelSize: k, width = Math.round(Math.abs(dx) / k), height = Math.round(Math.abs(dy) / k)} = this;

    // Interpolate the raster grid, as needed.
    if (this.interpolate) {
      const kx = width / Math.abs(dx);
      const ky = height / Math.abs(dy);
      const {x: X, y: Y} = Position(channels, scales, context);
      const IX = X && map(X, (x) => (x - x1) * kx, Float64Array);
      const IY = Y && map(Y, (y) => (y - y1) * ky, Float64Array);
      // Since the contour mark normally skips filtering on x and y, here we’re
      // careful to use different names to apply filtering.
      const index = this.filter(facets[0], {ix: channels.x, iy: channels.y}, {ix: IX, iy: IY});
      V = this.interpolate(index, width, height, IX, IY, V); // TODO faceting?
    }

    // Blur the raster grid, if desired.
    if (this.blur > 0) blur2({data: V, width, height}, this.blur);

    // Compute the contours.
    const geometries = contours().thresholds(thresholds).size([width, height])(V);

    // Rescale the contour multipolygon from grid to screen coordinates.
    for (const {coordinates} of geometries) {
      for (const rings of coordinates) {
        for (const ring of rings) {
          for (const point of ring) {
            point[0] = (point[0] / width) * dx + x1;
            point[1] = (point[1] / height) * dy + y1;
          }
        }
      }
    }

    // Compute the deferred channels.
    return {
      data: geometries,
      facets: [range(geometries)],
      channels: Channels(this.contourChannels, geometries)
    };
  });
}

export function contour() {
  return new Contour(...maybeTuples(...arguments));
}
