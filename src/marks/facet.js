import {group} from "d3-array";
import {create} from "d3-selection";
import {Mark} from "../mark.js";
import {autoScaleRange} from "../scales.js";

export class FacetY extends Mark {
  constructor(data, {y} = {}, marks = []) {
    super(
      data,
      [
        {name: "y", value: y, scale: "y", type: "band"}
      ]
    );
    this.marks = marks;
    this.facets = undefined; // set by initialize
  }
  initialize(data) {
    const {index, channels: [y]} = super.initialize(data);
    const [, {value: Y}] = y;
    const subchannels = [];
    const facets = this.facets = new Map();

    //
    for (const [facetKey, facetIndex] of group(index, (d, i) => Y[i])) {
      const facetData = Array.from(facetIndex, i => data[i]);
      const markIndex = new Map();
      const markChannels = new Map();
      for (const mark of this.marks) {
        if (markIndex.has(mark)) throw new Error("duplicate mark");
        const markData = mark.data === data ? facetData : mark.data;
        const named = Object.create(null);
        const {index, channels} = mark.initialize(markData);
        for (const [name, channel] of channels) {
          if (name !== undefined) named[name] = channel.value;
          subchannels.push([undefined, facetYChannel(channel)]);
        }
        markIndex.set(mark, index);
        markChannels.set(mark, named);
      }
      facets.set(facetKey, {markIndex, markChannels});
    }

    return {index, channels: [y, ...subchannels]};
  }
  render(index, {y, fy, ...scales}, channels, options) {
    const {marks, facets} = this;
    const {marginRight, marginLeft, width} = options;
    const subscales = {y: fy, ...scales};

    const subdimensions = {
      marginTop: 0,
      marginRight,
      marginBottom: 0,
      marginLeft,
      width,
      height: y.bandwidth()
    };

    autoScaleRange({y: options.fy}, subdimensions);

    return create("svg:g")
        .call(g => g.selectAll()
          .data(y.domain())
          .join("g")
            .attr("transform", (key) => `translate(0,${y(key)})`)
            .each(function(key) {
              const {markIndex, markChannels} = facets.get(key);
              for (const mark of marks) {
                const node = mark.render(
                  markIndex.get(mark),
                  subscales,
                  markChannels.get(mark),
                  subdimensions
                );
                if (node != null) this.appendChild(node);
              }
            }))
      .node();
  }
}

export function facetY(data, options, marks) {
  return new FacetY(data, options, marks);
}

function facetYChannel({scale, ...channel}) {
  return {...channel, scale: scale === "y" ? "fy" : scale};
}
