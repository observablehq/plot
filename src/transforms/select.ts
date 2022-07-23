import type {MarkOptions, Selector, SelectorFunction} from "../api.js";
import type {DataArray, Datum, index, Series, ValueArray} from "../data.js";

type InstantiatedSelector =
  | ((I: Series, X: ValueArray) => Iterable<index> | Generator<number | undefined, void, unknown>)
  | ((I: Series) => Iterable<index> | Generator<number | undefined, void, unknown>);

import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../options.js";
import {basic} from "./basic.js";

export function select<T extends Datum>(selector: Selector, options: MarkOptions<T> = {}) {
  // If specified selector is a string or function, it’s a selector without an
  // input channel such as first or last.
  if (typeof selector === "string") {
    switch (selector.toLowerCase()) {
      case "first":
        return selectFirst(options);
      case "last":
        return selectLast(options);
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
    value = maybeSelector(selector[key]);
  }
  if (value === undefined) throw new Error(`invalid selector: ${selector}`);
  return selectChannel(key, value, options);
}

function maybeSelector(selector: SelectorFunction): InstantiatedSelector {
  if (typeof selector === "function") return selector;
  switch (`${selector}`.toLowerCase()) {
    case "min":
      return selectorMin;
    case "max":
      return selectorMax;
  }
  throw new Error(`unknown selector: ${selector}`);
}

export function selectFirst<T extends Datum>(options: MarkOptions<T>) {
  return selectChannel(null, selectorFirst, options);
}

export function selectLast<T extends Datum>(options: MarkOptions<T>) {
  return selectChannel(null, selectorLast, options);
}

export function selectMinX<T extends Datum>(options: MarkOptions<T>) {
  return selectChannel("x", selectorMin, options);
}

export function selectMinY<T extends Datum>(options: MarkOptions<T>) {
  return selectChannel("y", selectorMin, options);
}

export function selectMaxX<T extends Datum>(options: MarkOptions<T>) {
  return selectChannel("x", selectorMax, options);
}

export function selectMaxY<T extends Datum>(options: MarkOptions<T>) {
  return selectChannel("y", selectorMax, options);
}

function* selectorFirst(I: Series) {
  yield I[0];
}

function* selectorLast(I: Series) {
  yield I[I.length - 1];
}

function* selectorMin(I: Series, X: ValueArray) {
  yield least(I, (i) => X[i]);
}

function* selectorMax(I: Series, X: ValueArray) {
  yield greatest(I, (i) => X[i]);
}

function selectChannel<T extends Datum>(
  v0: string | null | undefined,
  selector: InstantiatedSelector,
  options: MarkOptions<T>
) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  let v: any = v0;
  if (v0 != null) {
    if ((options[v0 as keyof MarkOptions<T>] as ValueArray) == null) throw new Error(`missing channel: ${v}`);
    v = options[v0 as keyof MarkOptions<T>];
  }
  const z = maybeZ(options);
  return basic(options, (data: DataArray<T>, facets: Series[]) => {
    const Z = valueof(data, z);
    const V = valueof(data, v);
    const selectFacets = [];
    for (const facet of facets) {
      const selectFacet = [];
      for (const I of Z ? group(facet, (i) => Z[i]).values() : [facet]) {
        // TODO: check if V can be null | undefined??
        for (const i of selector(I, V as ValueArray)) {
          if (i !== undefined) selectFacet.push(i);
        }
      }
      selectFacets.push(selectFacet);
    }
    return {data, facets: selectFacets};
  });
}
