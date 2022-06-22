import {contourDensity, create, geoPath} from "d3";
import {constant, maybeTuple, maybeZ, valueof} from "../options.js";
import {Mark} from "../plot.js";
import {applyFrameAnchor, applyGroupedChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, groupZ} from "../style.js";

const defaults = {
  ariaLabel: "density",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

export class Density extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, weight, bandwidth = 20, thresholds = 20} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "weight", value: weight, optional: true},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      defaults
    );
    this.bandwidth = +bandwidth;
    this.thresholds = +thresholds;
    this.z = z;
    this.path = geoPath();
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions) {
    const {contours} = channels;
    const {path} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyTransform, this, scales)
        .call(g => g.selectAll()
          .data(Array.from(index, i => [i]))
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, channels)
            .attr("d", ([i]) => path(contours[i])))
        .node();
  }
}

export function density(data, {x, y, stroke, fill, bandwidth = 20, thresholds = 20, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  let f, s;
  if (fill === "density") { fill = undefined; f = true; }
  if (stroke === "density") { stroke = undefined; s = true; }
  return new Density(data, {...options, x, y, fill, stroke, initializer: initializer(+bandwidth, +thresholds, f, s)});
}

function initializer(bandwidth, thresholds, f, s) {
  return function (data, facets, channels, scales, dimensions) {
    const X = valueof(channels.x.value, scales.x);
    const Y = valueof(channels.y.value, scales.y);
    const W = channels.weight?.value;
    const Z = channels.z?.value;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const {width, height} = dimensions;
    const newFacets = [];
    const contours = [];
    const {z} = this;
    const newChannels = Object.entries(channels).filter(([key]) => key !== "x" && key !== "y" && key !== "weight").map(([key, d]) => [key, {...d, value: []}]);
    if (f) newChannels.push(["fill", {value: [], scale: "color"}]);
    if (s) newChannels.push(["stroke", {value: [], scale: "color"}]);
    let j = 0;
    for (const facet of facets) {
      const newFacet = [];
      newFacets.push(newFacet);
      for (const index of Z ? groupZ(facet, Z, z) : [facet]) {
        for (const contour of contourDensity()
          .x(X ? i => X[i] : constant(cx))
          .y(Y ? i => Y[i] : constant(cy))
          .weight(W ? i => W[i] : 1)
          .size([width, height])
          .bandwidth(bandwidth)
          .thresholds(thresholds)
          (index)) {
            newFacet.push(j++);
            contours.push(contour);
            for (const [key, {value}] of newChannels) {
              value.push(
                (f && key === "fill") || (s && key === "stroke") ? contour.value
                : channels[key].value[index[0]]);
            }
        }
      }
    }
    return {data, facets: newFacets, channels: {
      contours: {value: contours},
      ...Object.fromEntries(newChannels)
    }};
  };
}
