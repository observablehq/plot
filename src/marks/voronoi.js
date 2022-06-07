import {create, Delaunay} from "d3";
import {maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";

const defaults = {
  ariaLabel: "voronoi",
  fill: "none",
  stroke: "currentColor"
};

export class Voronoi extends Mark {
  constructor(data, options = {}) {
    const {x, y} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"}
      ],
      options,
      defaults
    );
  }
  render(index, {x, y}, channels, dimensions) {
    const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
    const {x: X, y: Y} = channels;
    const {dx, dy} = this;
    // TODO Group by z, fill, or stroke.
    const delaunay = Delaunay.from(index, i => X[i], i => Y[i]);
    const voronoi = delaunay.voronoi([marginLeft, marginTop, width - marginRight, height - marginBottom]);
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .attr("d", (_, i) => voronoi.renderCell(i))
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function voronoi(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Voronoi(data, {...options, x, y});
}

// TODO voronoiX, voronoiY?
