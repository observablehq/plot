import {contourDensity, create, geoPath} from "d3";
import {constant, maybeTuple, valueof} from "../options.js";
import {Mark} from "../plot.js";
import {applyFrameAnchor, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "density",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

export class Density extends Mark {
  constructor(data, options = {}) {
    const {x, y, bandwidth = 20, thresholds = 20} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true}
      ],
      options,
      defaults
    );
    this.bandwidth = +bandwidth;
    this.thresholds = +thresholds;
    this.path = geoPath();
  }
  render(index, scales, channels, dimensions) {
    const {contours: C} = channels;
    const {path} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyTransform, this, scales)
        .call(g => g.selectAll()
          .data(index)
          .enter()
          .append("path")
            .attr("d", i => path(C[i])))
      .node();
  }
}

export function density(data, {x, y, bandwidth = 20, thresholds = 20, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Density(data, {...options, x, y, initializer: initializer(+bandwidth, +thresholds)});
}

function initializer(bandwidth, thresholds) {
  return function (data, facets, channels, scales, dimensions) {
    const X = valueof(channels.x.value, scales.x);
    const Y = valueof(channels.y.value, scales.y);
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const {width, height} = dimensions;
    const newFacets = [];
    const contours = [];
    for (const index of facets) {
      const newFacet = [];
      newFacets.push(newFacet);
      for (const contour of contourDensity()
        .x(X ? i => X[i] : constant(cx))
        .y(Y ? i => Y[i] : constant(cy))
        .size([width, height])
        .bandwidth(bandwidth)
        .thresholds(thresholds)
        (index)) {
          const i = newFacet.length;
          newFacet.push(i);
          contours.push(contour);
      }
    }
    return {data, facets: newFacets, channels: {contours: {value: contours}}};
  };
}
