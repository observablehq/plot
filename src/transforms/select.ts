import type {IndexArray, Channel, MarkOptions, MarkOptionsDefined, FieldOptionsKey, FieldOptions, ConstantOrFieldOption, nullish} from "../common.js";

import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../options.js";
import {basic} from "./basic.js";

export type Selector = string | "first" | "last" | ComputedSelector;
export type MultiSelector = Record<string, Selector>;
type ComputedSelector = (((I: IndexArray, X: Channel) => IterableIterator<number> | Generator<number | undefined>) | ((I: IndexArray, X?: Channel) => IterableIterator<number> | Generator<number | undefined>));

export function select(selector: Selector | MultiSelector, options: MarkOptions = {}): MarkOptions {
  // If specified selector is a string or function, it’s a selector without an
  // input channel such as first or last.
  if (typeof selector === "string") {
    switch (selector.toLowerCase()) {
      case "first": return selectFirst(options);
      case "last": return selectLast(options);
    }
    throw new Error(`invalid selector: ${selector}`);
  }
  if (typeof selector === "function") {
    return selectChannel(null, selector, options);
  }
  // Otherwise the selector is an option {name: value} where name is a channel
  // name and value is a selector definition that additionally takes the given
  // channel values as input. The selector object must have exactly one key.
  let key, value;
  for (key in selector) {
    if (value !== undefined) throw new Error("ambiguous selector; multiple inputs");
    value = maybeSelector(selector[key as string]);
  }
  if (value === undefined) throw new Error(`invalid selector: ${selector}`);
  return selectChannel(key as FieldOptionsKey, value, options);
}

function maybeSelector(selector: Selector): ComputedSelector {
  if (typeof selector === "function") return selector;
  switch (`${selector}`.toLowerCase()) {
    case "min": return selectorMin;
    case "max": return selectorMax;
  }
  throw new Error(`unknown selector: ${selector}`);
}

export function selectFirst(options: MarkOptionsDefined) {
  return selectChannel(null, selectorFirst, options);
}

export function selectLast(options: MarkOptionsDefined) {
  return selectChannel(null, selectorLast, options);
}

export function selectMinX(options: MarkOptionsDefined) {
  return selectChannel("x", selectorMin, options);
}

export function selectMinY(options: MarkOptionsDefined) {
  return selectChannel("y", selectorMin, options);
}

export function selectMaxX(options: MarkOptionsDefined) {
  return selectChannel("x", selectorMax, options);
}

export function selectMaxY(options: MarkOptionsDefined) {
  return selectChannel("y", selectorMax, options);
}

function* selectorFirst(I: IndexArray) {
  yield I[0];
}

function* selectorLast(I: IndexArray) {
  yield I[I.length - 1];
}

function* selectorMin(I: IndexArray, X: Channel) {
  yield least(I, i => X[i]);
}

function* selectorMax(I: IndexArray, X: Channel) {
  yield greatest(I, i => X[i]);
}

function selectChannel(v1: FieldOptionsKey | nullish, selector: ComputedSelector, options: FieldOptions) {
  let v: ConstantOrFieldOption;
  if (v1 != null) {
    if (options[v1] == null) throw new Error(`missing channel: ${v}`);
    v = options[v1];
  } else {
    v = v1;
  }
  const z = maybeZ(options);
  return basic(options, (data, facets) => {
    const Z = valueof(data, z);
    const V = valueof(data, v);
    const selectFacets = [];
    for (const facet of facets as IndexArray[]) {
      const selectFacet = [];
      for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
        for (const i of selector(I, V as Channel)) {
          if (i !== undefined) selectFacet.push(i);
        }
      }
      selectFacets.push(selectFacet);
    }
    return {data, facets: selectFacets};
  });
}
