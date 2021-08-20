import {cross, difference, groups, InternMap} from "d3";
import {create} from "d3";
import {Mark, first, second, markify, where} from "./mark.js";
import {applyScales} from "./scales.js";
import {filterStyles} from "./style.js";

export function facets(data, {x, y, ...options}, marks) {
  return x === undefined && y === undefined
    ? marks // if no facets are specified, ignore!
    : [new Facet(data, {x, y, ...options}, marks)];
}

class Facet extends Mark {
  constructor(data, {x, y, ...options} = {}, marks = []) {
    if (data == null) throw new Error("missing facet data");
    super(
      data,
      [
        {name: "fx", value: x, scale: "fx", optional: true},
        {name: "fy", value: y, scale: "fy", optional: true}
      ],
      options
    );
    this.marks = marks.flat(Infinity).map(markify);
    // The following fields are set by initialize:
    this.marksChannels = undefined; // array of mark channels
    this.marksIndexByFacet = undefined; // map from facet key to array of mark indexes
  }
  initialize() {
    const {index, channels} = super.initialize();
    const facets = index === undefined ? [] : facetGroups(index, channels);
    const facetsKeys = Array.from(facets, first);
    const facetsIndex = Array.from(facets, second);
    const subchannels = [];
    const marksChannels = this.marksChannels = [];
    const marksIndexByFacet = this.marksIndexByFacet = facetMap(channels);
    for (const facetKey of facetsKeys) {
      marksIndexByFacet.set(facetKey, new Array(this.marks.length));
    }
    let facetsExclude;
    for (let i = 0; i < this.marks.length; ++i) {
      const mark = this.marks[i];
      const {facet} = mark;
      const markFacets = facet === "auto" ? mark.data === this.data ? facetsIndex : undefined
        : facet === "include" ? facetsIndex
        : facet === "exclude" ? facetsExclude || (facetsExclude = facetsIndex.map(f => Uint32Array.from(difference(index, f))))
        : undefined;
      const {index: I, channels: markChannels} = mark.initialize(markFacets, channels);
      // If an index is returned by mark.initialize, its structure depends on
      // whether or not faceting has been applied: it is a flat index ([0, 1, 2,
      // …]) when not faceted, and a nested index ([[0, 1, …], [2, 3, …], …])
      // when faceted.
      if (I !== undefined) {
        if (markFacets) {
          for (let j = 0; j < facetsKeys.length; ++j) {
            marksIndexByFacet.get(facetsKeys[j])[i] = I[j];
          }
        } else {
          for (let j = 0; j < facetsKeys.length; ++j) {
            marksIndexByFacet.get(facetsKeys[j])[i] = I;
          }
        }
      }
      for (const [, channel] of markChannels) {
        subchannels.push([, channel]);
      }
      marksChannels.push(markChannels);
    }
    return {index, channels: [...channels, ...subchannels]};
  }
  render(I, scales, channels, dimensions, axes) {
    const {marks, marksChannels, marksIndexByFacet} = this;
    const {fx, fy} = scales;
    const fyDomain = fy && fy.domain();
    const fxDomain = fx && fx.domain();
    const fyMargins = fy && {marginTop: 0, marginBottom: 0, height: fy.bandwidth()};
    const fxMargins = fx && {marginRight: 0, marginLeft: 0, width: fx.bandwidth()};
    const subdimensions = {...dimensions, ...fxMargins, ...fyMargins};
    const marksValues = marksChannels.map(channels => applyScales(channels, scales));
    return create("svg:g")
        .call(g => {
          if (fy && axes.y) {
            const axis1 = axes.y, axis2 = nolabel(axis1);
            const j = axis1.labelAnchor === "bottom" ? fyDomain.length - 1 : axis1.labelAnchor === "center" ? fyDomain.length >> 1 : 0;
            const fyDimensions = {...dimensions, ...fyMargins};
            g.selectAll()
              .data(fyDomain)
              .join("g")
              .attr("transform", ky => `translate(0,${fy(ky)})`)
              .append((ky, i) => (i === j ? axis1 : axis2).render(
                fx && where(fxDomain, kx => marksIndexByFacet.has([kx, ky])),
                scales,
                null,
                fyDimensions
              ));
          }
          if (fx && axes.x) {
            const axis1 = axes.x, axis2 = nolabel(axis1);
            const j = axis1.labelAnchor === "right" ? fxDomain.length - 1 : axis1.labelAnchor === "center" ? fxDomain.length >> 1 : 0;
            const {marginLeft, marginRight} = dimensions;
            const fxDimensions = {...dimensions, ...fxMargins, labelMarginLeft: marginLeft, labelMarginRight: marginRight};
            g.selectAll()
              .data(fxDomain)
              .join("g")
              .attr("transform", kx => `translate(${fx(kx)},0)`)
              .append((kx, i) => (i === j ? axis1 : axis2).render(
                fy && where(fyDomain, ky => marksIndexByFacet.has([kx, ky])),
                scales,
                null,
                fxDimensions
              ));
          }
        })
        .call(g => g.selectAll()
          .data(facetKeys(scales).filter(marksIndexByFacet.has, marksIndexByFacet))
          .join("g")
            .attr("transform", facetTranslate(fx, fy))
            .each(function(key) {
              const marksFacetIndex = marksIndexByFacet.get(key);
              for (let i = 0; i < marks.length; ++i) {
                const values = marksValues[i];
                const index = filterStyles(marksFacetIndex[i], values);
                const node = marks[i].render(
                  index,
                  scales,
                  values,
                  subdimensions
                );
                if (node != null) this.appendChild(node);
              }
            }))
      .node();
  }
}

// Derives a copy of the specified axis with the label disabled.
function nolabel(axis) {
  return axis === undefined || axis.label === undefined
    ? axis // use the existing axis if unlabeled
    : Object.assign(Object.create(axis), {label: undefined});
}

// Unlike facetGroups, which returns groups in order of input data, this returns
// keys in order of the associated scale’s domains.
function facetKeys({fx, fy}) {
  return fx && fy ? cross(fx.domain(), fy.domain())
    : fx ? fx.domain()
    : fy.domain();
}

// Returns an array of [[key1, index1], [key2, index2], …] representing the data
// indexes associated with each facet. For two-dimensional faceting, each key
// is a two-element array; see also facetMap.
function facetGroups(index, channels) {
  return (channels.length > 1 ? facetGroup2 : facetGroup1)(index, ...channels);
}

function facetGroup1(index, [, {value: F}]) {
  return groups(index, i => F[i]);
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

function facetMap(channels) {
  return new (channels.length > 1 ? FacetMap2 : FacetMap);
}

class FacetMap {
  constructor() {
    this._ = new InternMap();
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
    else super.set(key1, new InternMap([[key2, value]]));
    return this;
  }
}
