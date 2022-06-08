import {create, group, select, Delaunay} from "d3";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {delaunayMark} from "./delaunay.js";

const defaults = {
  ariaLabel: "voronoi",
  fill: "none",
  stroke: "currentColor"
};

export class Voronoi extends Mark {
  constructor(data, options = {}) {
    const {x, y, z} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true}
      ],
      options,
      defaults
    );
  }
  render(index, {x, y}, channels, dimensions) {
    const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
    const {x: X, y: Y, z: Z} = channels;
    const {dx, dy} = this;

    function cells(index) {
      const delaunay = Delaunay.from(index, i => X[i], i => Y[i]);
      const voronoi = delaunay.voronoi([marginLeft, marginTop, width - marginRight, height - marginBottom]);
      select(this)
        .selectAll()
        .data(index)
        .enter()
        .append("path")
          .call(applyDirectStyles, this)
          .attr("d", (_, i) => voronoi.renderCell(i))
          .call(applyChannelStyles, this, channels);
    }

    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(Z
          ? g => g.selectAll().data(group(index, i => Z[i]).values()).enter().append("g").each(cells)
          : g => g.datum(index).each(cells))
      .node();
  }
}

// TODO voronoiX, voronoiY?
export function voronoi(data, options) {
  return delaunayMark(Voronoi, data, options);
}
