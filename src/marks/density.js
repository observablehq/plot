import {contourDensity, create, geoPath} from "d3";
import {constant, maybeTuple, maybeZ, valueof} from "../options.js";
import {Mark} from "../plot.js";
import {applyFrameAnchor, applyGroupedChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, groupZ} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "density",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

export class Density extends Mark {
  constructor(data, {x, y, z, weight, stroke, fill, bandwidth = 20, thresholds = 20, ...options} = {}) {
    let f, s;
    if (fill === "density") { fill = undefined; f = true; }
    if (stroke === "density") { stroke = undefined; s = true; }
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "weight", value: weight, optional: true},
        {name: "z", value: maybeZ({z, fill, stroke}), optional: true}
      ],
      densityInitializer({...options, fill, stroke}, +bandwidth, +thresholds, f, s),
      defaults
    );
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

export function density(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Density(data, {...options, x, y});
}

function densityInitializer(options, bandwidth, thresholds, f, s) {
  return initializer(options, function(data, facets, channels, scales, dimensions) {
    const X = valueof(channels.x.value, scales.x);
    const Y = valueof(channels.y.value, scales.y);
    const W = channels.weight?.value;
    const Z = channels.z?.value;
    const {z} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const {width, height} = dimensions;
    const newFacets = [];
    const contours = [];
    const newChannels = Object.entries(channels).filter(([key]) => key !== "x" && key !== "y" && key !== "weight").map(([key, d]) => [key, {...d, value: []}]);
    if (f) newChannels.push(["fill", {value: [], scale: "color"}]);
    if (s) newChannels.push(["stroke", {value: [], scale: "color"}]);
    let max = 0, maxn = 0;
    const density = contourDensity()
      .x(X ? i => X[i] : constant(cx))
      .y(Y ? i => Y[i] : constant(cy))
      .weight(W ? i => W[i] : 1)
      .size([width, height])
      .bandwidth(bandwidth)
      .thresholds(thresholds);

    // First pass: seek the maximum density across all facets and series; memoize for performance.
    const memo = [];
    for (const [facetIndex, facet] of facets.entries()) {
      newFacets.push([]);
      for (const index of Z ? groupZ(facet, Z, z) : [facet]) {
        const c = density(index);
        const d = c[c.length - 1];
        if (d.value > max) {
          max = d.value;
          maxn = c.length;
          thresholds = c.map(d => d.value);
        }
        memo.push({facetIndex, index, c, top: d.value});
      }
    }

    // Second pass: generate contours with the thresholds derived above
    // https://github.com/d3/d3-contour/pull/57
    const thf = Math.pow(2, density.cellSize());
    thresholds = thresholds.map(value => value * thf);

    density.thresholds(thresholds);
    for (const {facetIndex, index, c: memoc, top} of memo) {
      const c = top < max ? density(index) : memoc;
      for (const contour of c) {
        newFacets[facetIndex].push(contours.length);
        contours.push(contour);
        for (const [key, {value}] of newChannels) {
          value.push(
            (f && key === "fill") || (s && key === "stroke") ? contour.value
            : channels[key].value[index[0]]
          );
        }
      }
    }

    channels = {contours: {value: contours}, ...Object.fromEntries(newChannels)};
    // normalize colors to a thresholds scale
    const m = max * (maxn + 1) / maxn;
    if (f) channels.fill.value = channels.fill.value.map(v => v / m);
    if (s) channels.stroke.value = channels.stroke.value.map(v => v / m);

    return {data, facets: newFacets, channels};
  });
}
