import {contourDensity, create, geoPath} from "d3";
import {constant, maybeTuple} from "../options.js";
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
  }
  render(index, scales, channels, dimensions) {
    const {x: X, y: Y} = channels;
    const {bandwidth, thresholds} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const {width, height} = dimensions;
    return create("svg:g")
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyTransform, this, scales)
        .call(g => g.selectAll("path")
          .data(contourDensity()
              .x(X ? i => X[i] : constant(cx))
              .y(Y ? i => Y[i] : constant(cy))
              .size([width, height])
              .bandwidth(bandwidth)
              .thresholds(thresholds)
            (index))
          .enter()
          .append("path")
            .attr("d", geoPath()))
      .node();
  }
}

export function density(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Density(data, {...options, x, y});
}
