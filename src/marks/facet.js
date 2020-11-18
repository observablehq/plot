import {group} from "d3-array";
import {create} from "d3-selection";
import {Mark, indexOf} from "../mark.js";
import {ScaleChannels} from "../plot.js";
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
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", type: "band"}
      ]
    );
    this.options = options;
  }
  render(I, {y: {scale: y, domain}, ...scales}, dimensions) {
    const {data, options, channels: {y: {value: Y}}} = this;
    const {marks: submarks = []} = options;
    const subchannels = ScaleChannels(submarks);
    const subscales = {...Scales(subchannels, options.scales), ...scales};
    const subdimensions = {...dimensions, marginTop: 0, marginBottom: 0, height: y.bandwidth()};
    const G = group(I, i => Y[i]);

    autoScaleRange(subscales, subdimensions);

    return create("svg:g")
        .call(g => g.selectAll()
          .data(domain)
          .join("g")
            .attr("transform", (key) => `translate(0,${y(key)})`)
            .each(function(key) {
              for (const mark of submarks) {
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
