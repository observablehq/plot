import {group} from "d3-array";
import {create} from "d3-selection";
import {Mark, indexOf} from "../mark.js";
import {Channels} from "../plot.js";
import {Scales, autoScaleRange} from "../scales.js";

export class FacetY extends Mark {
  constructor(
    data,
    {
      x,
      y
    } = {},
    options = {}
  ) {
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y", type: "band"}
      }
    );
    this.options = options;
  }
  render(I, {y: {scale: y}, ...scales}, dimensions) {
    const {data, options, channels: {y: {value: Y}}} = this;
    const {marks: submarks = []} = options;
    const subchannels = Channels(submarks);
    const subscales = {...Scales(subchannels, options.scales), ...scales};
    const subdimensions = {...dimensions, marginTop: 0, marginBottom: 0, height: y.bandwidth()};

    autoScaleRange(subscales, subdimensions);

    return create("svg:g")
        .call(g => g.selectAll()
          .data(group(I, i => Y[i]))
          .join("g")
            .attr("transform", ([key]) => `translate(0,${y(key)})`)
            .each(function([, I]) {
              for (const mark of submarks) {
                const index = mark.data === data ? I
                  : mark.data === undefined ? undefined
                  : Array.from(mark.data, indexOf);
                const node = mark.render(index, subscales, subdimensions);
                if (node != null) this.appendChild(node);
              }
            }))
      .node();
  }
}
