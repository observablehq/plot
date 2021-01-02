import {cross, group, groups} from "d3-array";
import {create} from "d3-selection";
import {Mark, take} from "../mark.js";
import {autoScaleRange} from "../scales.js";

class Facet extends Mark {
  constructor(data, {x, y, transform} = {}, marks = []) {
    if (data === undefined) throw new Error("missing facet data");
    super(
      data,
      [
        {name: "fx", value: x, scale: "fx", type: "band", optional: true},
        {name: "fy", value: y, scale: "fy", type: "band", optional: true}
      ],
      transform
    );
    this.marks = marks;
    // The following fields are set by initialize:
    this.marksChannels = undefined; // array of mark channels
    this.marksIndexByFacet = undefined; // map from facet key to array of mark indexes
  }
  initialize() {
    const {index, channels} = super.initialize();
    const marksIndexByFacet = this.marksIndexByFacet = facetMap(channels);
    const facets = facetGroups(index, channels);
    const facetsKeys = Array.from(facets.keys());
    const facetsIndex = Array.from(facets.values());
    const subchannels = [];
    const marksChannels = this.marksChannels = [];
    for (const facetKey of facetsKeys) {
      marksIndexByFacet.set(facetKey, new Array(this.marks.length)); // TODO optimize
    }
    for (let i = 0; i < this.marks.length; ++i) {
      const mark = this.marks[i];
      const facets = mark.data === this.data ? facetsIndex : undefined;
      const {index, channels} = mark.initialize(facets);
      // If an index is returned by mark.initialize, its structure depends on
      // whether or not faceting has been applied: it is a flat index ([0, 1, 2,
      // …]) when not faceted, and a nested index ([[0, 1, …], [2, 3, …], …])
      // when faceted. Faceting is only applied if the mark data is the same as
      // the facet’s data.
      if (index !== undefined) {
        for (let j = 0; j < facetsKeys.length; ++j) {
          marksIndexByFacet.get(facetsKeys[j])[i] = facets ? index[j] : index;
        }
      }
      const named = Object.create(null);
      for (const [name, channel] of channels) {
        if (name !== undefined) named[name] = channel.value;
        subchannels.push([undefined, channel]);
      }
      marksChannels.push(named);
    }
    return {index, channels: [...channels, ...subchannels]};
  }
  render(index, scales, channels, options) {
    const {marks, marksChannels, marksIndexByFacet} = this;
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
          .data(facetKeys(scales).filter(key => marksIndexByFacet.has(key)))
          .join("g")
            .attr("transform", facetTranslate(fx, fy))
            .each(function(key) {
              const marksIndex = marksIndexByFacet.get(key);
              for (let i = 0; i < marks.length; ++i) {
                const node = marks[i].render(
                  marksIndex[i],
                  scales,
                  marksChannels[i],
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
