import {group} from "d3-array";
import {create} from "d3-selection";
import {Mark} from "../mark.js";
import {autoScaleRange} from "../scales.js";

// TODO facet-x
export class Facet extends Mark {
  constructor(data, {y, transform} = {}, marks = []) {
    super(
      data,
      [
        {name: "fy", value: y, scale: "fy", type: "band"}
      ],
      transform
    );
    this.marks = marks;
    this.facets = undefined; // set by initialize
  }
  initialize(data) {
    const {index, channels: [fy]} = super.initialize(data);
    const [, {value: FY}] = fy;
    const subchannels = [];
    const facets = this.facets = new Map();

    for (const [facetKey, facetIndex] of group(index, i => FY[i])) {
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
          subchannels.push([undefined, channel]);
        }
        markIndex.set(mark, index);
        markChannels.set(mark, named);
      }
      facets.set(facetKey, {markIndex, markChannels});
    }

    return {index, channels: [fy, ...subchannels]};
  }
  render(index, scales, channels, options) {
    const {marks, facets} = this;
    const {fy} = scales;
    const {y, marginRight, marginLeft, width} = options;

    const subdimensions = {
      marginTop: 0,
      marginRight,
      marginBottom: 0,
      marginLeft,
      width,
      height: fy.bandwidth()
    };

    autoScaleRange({y}, subdimensions);

    return create("svg:g")
        .call(g => g.selectAll()
          .data(fy.domain())
          .join("g")
            .attr("transform", (key) => `translate(0,${fy(key)})`)
            .each(function(key) {
              const {markIndex, markChannels} = facets.get(key);
              for (const mark of marks) {
                const node = mark.render(
                  markIndex.get(mark),
                  scales,
                  markChannels.get(mark),
                  subdimensions
                );
                if (node != null) this.appendChild(node);
              }
            }))
      .node();
  }
}
