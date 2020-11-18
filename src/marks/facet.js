import {group} from "d3-array";
import {create} from "d3-selection";
import {Mark, indexOf} from "../mark.js";
import {autoScaleRange} from "../scales.js";

export class FacetY extends Mark {
  constructor(data, {y} = {}, marks = []) {
    super(
      data,
      [
        {name: "y", value: y, scale: "y", type: "band"},
        ...marks.flatMap(m => m.scaleChannels.map(facetYChannel))
      ]
    );
    this.marks = marks;
  }
  render(I, {y: {scale: y, domain}, fy, ...scales}, dimensions) {
    const {data, marks, channels: {y: {value: Y}}} = this;
    const subscales = {y: fy, ...scales};
    const subdimensions = {...dimensions, marginTop: 0, marginBottom: 0, height: y.bandwidth()};
    const G = group(I, i => Y[i]);

    autoScaleRange({y: fy}, subdimensions);

    return create("svg:g")
        .call(g => g.selectAll()
          .data(domain)
          .join("g")
            .attr("transform", (key) => `translate(0,${y(key)})`)
            .each(function(key) {
              for (const mark of marks) {
                const index = mark.data === data ? G.get(key)
                  : mark.data === undefined ? undefined
                  : Array.from(mark.data, indexOf);
                const node = mark.render(index, subscales, subdimensions);
                if (node != null) this.appendChild(node);
              }
            }))
      .node();
  }
}

export function facetY(data, channels, marks) {
  return new FacetY(data, channels, marks);
}

function facetYChannel({scale, ...channel}) {
  return {...channel, name: undefined, scale: scale === "y" ? "fy" : scale};
}
