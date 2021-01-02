import {cross, group, groups} from "d3-array";
import {create} from "d3-selection";
import {Mark, take} from "../mark.js";
import {autoScaleRange} from "../scales.js";

class Facet extends Mark {
  constructor(data, {x, y, transform} = {}, marks = []) {
    super(
      data,
      [
        {name: "fx", value: x, scale: "fx", type: "band", optional: true},
        {name: "fy", value: y, scale: "fy", type: "band", optional: true}
      ],
      transform
    );
    this.marks = marks;
    this.facets = undefined; // set by initialize
  }
  initialize(data) {
    const {index, channels} = super.initialize(data);
    const subchannels = [];
    const facets = this.facets = facetMap(channels);
    for (const [facetKey, facetIndex] of facetGroups(index, channels)) {
      const facetData = take(data, facetIndex);
      const markIndex = new Map();
      const markChannels = new Map();
      for (const mark of this.marks) {
        if (markIndex.has(mark)) throw new Error("duplicate mark");
        const markData = mark.data === data ? facetData : mark.data;
        const markDataIndex = mark.data === data ? facetIndex : undefined;
        const named = Object.create(null);
        const {index, channels} = mark.initialize(markData, markDataIndex);
        for (const [name, channel] of channels) {
          if (name !== undefined) named[name] = channel.value;
          subchannels.push([undefined, channel]);
        }
        markIndex.set(mark, index);
        markChannels.set(mark, named);
      }
      facets.set(facetKey, {markIndex, markChannels});
    }
    return {index, channels: [...channels, ...subchannels]};
  }
  render(index, scales, channels, options) {
    const {marks, facets} = this;
    const {fx, fy} = scales;
    const {x, y, marginTop, marginRight, marginBottom, marginLeft, width, height} = options;

    const subdimensions = {
      ...fy
        ? {marginTop: 0, marginBottom: 0, height: fy.bandwidth()}
        : {marginTop, marginBottom, height},
      ...fx
        ? {marginRight: 0, marginLeft: 0, width: fx.bandwidth()}
        : {marginRight, marginLeft, width}
    };

    autoScaleRange({x, y}, subdimensions);

    return create("svg:g")
        .call(g => g.selectAll()
          .data(facetKeys(scales).filter(key => facets.has(key)))
          .join("g")
            .attr("transform", facetTranslate(fx, fy))
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

export function facets(data, {x, y, ...options}, marks) {
  return x === undefined && y === undefined
    ? marks // if no facets are specified, ignore!
    : [new Facet(data, {x, y, ...options}, marks)];
}

function facetMap(channels) {
  return new (channels.length > 1 ? FacetMap2 : FacetMap);
}

function facetKeys({fx, fy}) {
  return fx && fy ? cross(fx.domain(), fy.domain())
    : fx ? fx.domain()
    : fy.domain();
}

function facetGroups(index, channels) {
  return (channels.length > 1 ? facetGroup2 : facetGroup1)(index, ...channels);
}

function facetGroup1(index, [, {value: F}]) {
  return group(index, i => F[i]);
}

function facetGroup2(index, [, {value: FX}], [, {value: FY}]) {
  return groups(index, i => FX[i], i => FY[i])
    .flatMap(([x, xgroup]) => xgroup
    .map(([y, ygroup]) => [[x, y], ygroup]));
}

// This must match the key structure returned by facetGroups.
function facetTranslate(fx, fy) {
  return fx && fy ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx ? kx => `translate(${fx(kx)},0)`
    : ky => `translate(0,${fy(ky)})`;
}

class FacetMap {
  constructor() {
    this._ = new Map();
  }
  has(key) {
    return this._.has(key);
  }
  get(key) {
    return this._.get(key);
  }
  set(key, value) {
    return this._.set(key, value), this;
  }
}

// A Map-like interface that supports paired keys.
class FacetMap2 extends FacetMap {
  has([key1, key2]) {
    const map = super.get(key1);
    return map ? map.has(key2) : false;
  }
  get([key1, key2]) {
    const map = super.get(key1);
    return map && map.get(key2);
  }
  set([key1, key2], value) {
    const map = super.get(key1);
    if (map) map.set(key2, value);
    else super.set(key1, new Map([[key2, value]]));
    return this;
  }
}
