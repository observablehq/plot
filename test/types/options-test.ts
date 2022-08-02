import {expectError, expectType} from "tsd";
import type {Data, Row, Value, ValueArray} from "../../src/data.js";
import {Accessor, arrayify, ColorAccessor, map, maybeZero, TransformMethod} from "../../src/options.js";

import {
  constant,
  field,
  labelof,
  maybeColorChannel,
  maybeKeyword,
  maybeNumberChannel,
  percentile,
  valueof
} from "../../src/options.js";

// valueof
// _____________________________________________________________________

const numberTransform: TransformMethod<number[], number> = {
  transform: (data) => (data ? Array.from(data, (d) => d + 1) : [])
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nullTransform: TransformMethod = {
  transform: () => [1, 2, 3]
};

expectType<number[]>(valueof({length: 10}, (_, i) => i));
expectType<ValueArray>(valueof([1, 2, 3], numberTransform));
expectType<ValueArray>(valueof([1, 2, 3], nullTransform));
expectType<ValueArray>(valueof({length: 10}, nullTransform));
expectType<string[]>(valueof([{one: "one", two: "two"}], "one"));
expectType<number[]>(valueof([{one: 1, two: 1}], "one"));
expectType<Uint8Array>(valueof([{one: 1, two: 1}], "one", Uint8Array));
expectType<number[]>(valueof(Float32Array.of(1, 2, 3), (d) => d));
expectType<Date[]>(valueof({length: 10}, new Date()));
expectType<undefined>(valueof(undefined, (_, i) => i + 10));
expectType<undefined>(valueof(undefined, nullTransform));
expectType<null>(valueof(null, nullTransform));
expectType<number[]>(valueof({length: 10}, 1));
expectType<boolean[]>(valueof({length: 10}, true));
expectType<Uint8Array>(valueof({length: 10}, true, Uint8Array));
valueof([{one: "one", two: "two"}], (d) => {
  expectType<{one: string; two: string}>(d);
  return d.one;
});
valueof([true, false], (d) => {
  expectType<boolean>(d);
  return d;
});
expectType<Float32Array>(valueof([1, 2, 3], (d) => d * 2, Float32Array));
expectType<Float64Array>(valueof([1, 2, 3], (d) => d * 2, Float64Array));
expectType<ValueArray>(valueof([1, 2, 3], (d) => d * 2, Array));
expectType<string[]>(valueof({length: 10}, (_, i) => `My String #${i}`));

// red is not one of the keys, no autocompletion
expectError(() => valueof([{one: "one", two: "two"}], "red"));
expectType<null>(valueof(null, "red"));

// field
// _____________________________________________________________________

expectType<Value>(field("key")({key: "value"}));
expectType<Value>(field("foo")({key: "value"}));

// identity
// _____________________________________________________________________

// TODO: delete?
// expectType<number[]>(identity.transform([2, 3, 4]));
// expectType<boolean[]>(identity.transform([true]));
// expectType<Set<string>>(identity.transform(new Set(["one", "two"])));
// expectType<Set<string>>(identity.transform(new Set(["one", "two"])));
// // @ts-expect-error: not supported.
// expectType<Set<string>>(identity.transform(null));
// // @ts-expect-error: has to be array like.
// expectError(identity.transform(true));
// // @ts-expect-error: need to use non-identity accessor here.
// expectError(identity.transform({length: 10}));

// constant
// _____________________________________________________________________

expectType<"foo">(constant("foo")());
expectType<1>(constant(1)());
expectType<true>(constant(true)());
expectType<false>(constant(false)());
expectType<null>(constant(null)());

// percentile
// _____________________________________________________________________

expectType<number | undefined>(percentile("p99")([1, 2, 3, 4, 5], (i) => i));

// @ts-expect-error: the accessor function is required by percentile'e return type.
expectError(percentile("p99")([1, 2, 3, 4, 5]));

// maybeColorChannel
// _____________________________________________________________________

expectType<[Accessor<string, Value> | undefined, string | null | undefined]>(maybeColorChannel("red"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<[ColorAccessor<any, number> | undefined, string | null | undefined]>(maybeColorChannel(1));

// maybeNumberChannel
// _____________________________________________________________________

expectType<[Accessor<number, Value> | null | undefined, undefined] | [undefined, number | null]>(maybeNumberChannel(1));

// maybeKeyword
// _____________________________________________________________________

expectType<undefined>(maybeKeyword(null, "foo", ["bar"]));
expectType<undefined>(maybeKeyword(undefined, "foo", ["bar"]));
expectType<string | undefined>(maybeKeyword("bar", "foo", ["bar"]));

// keyword
// _____________________________________________________________________

// arrayify
// _____________________________________________________________________

expectType<null>(arrayify(null));
expectType<undefined>(arrayify(undefined));
expectType<null>(arrayify(null, Float32Array));
expectType<undefined>(arrayify(undefined, Float64Array));
expectType<number[]>(arrayify([1, 2, 3]));
expectType<number[]>(arrayify([1, 2, 3], undefined));
expectType<Float32Array>(arrayify([1, 2, 3], Float32Array));
expectType<Float64Array>(arrayify(new Float64Array([1, 2, 3]), Float64Array));
expectType<Float32Array>(arrayify(new Float64Array([1, 2, 3]), Float32Array));

// map
// _____________________________________________________________________

expectType<string[]>(map({length: 10}, (_, i) => `Item #${i}`));
expectType<string[]>(map({length: 10}, (_, i) => `Item #${i}`, Array));
expectType<string[]>(map([1, 2, 3], (_, i) => `Item #${i}`));
expectType<number[]>(map([1, 2, 3], (d) => d ** 2));
expectType<number[]>(map([1, 2, 3], (d) => d ** 2));
expectType<number[]>(map([1, 2, 3], (d) => d ** 2, undefined));
expectType<Float32Array>(map([1, 2, 3], (d) => d ** 2, Float32Array));
expectType<Float64Array>(map([1, 2, 3], (d) => d ** 2, Float64Array));
expectType<Float64Array>(map([{one: 2}], (d) => d.one ** 2, Float64Array));
expectType<Float64Array>(map([true, false], (d) => (d ? 1 : 0), Float64Array));
expectType<Value[]>(map([{one: 2}] as Data<Row>, field("one")));
expectType<Float64Array>(map([{one: 2}] as Data<Row>, field("one"), Float64Array));

// slice
// _____________________________________________________________________

// maybeZero
// _____________________________________________________________________

expectType<[number | Accessor<number, number>, number | Accessor<number, number>]>(maybeZero(10, undefined, undefined)); // [0, 10]
expectType<[number | Accessor<number, number>, number | Accessor<number, number>]>(maybeZero(undefined, undefined, 10)); // [0, 10]
expectType<[number | Accessor<number, number>, number | Accessor<number, number>]>(maybeZero(5, undefined, 10)); // [5, 10]
expectType<[number | Accessor<number, number>, number | Accessor<number, number>]>(maybeZero(5, 20, undefined)); // [20, 5]

// maybeTuple
// _____________________________________________________________________

// maybeZ
// _____________________________________________________________________

// range
// _____________________________________________________________________

// where
// _____________________________________________________________________

// take
// _____________________________________________________________________

// keyof
// _____________________________________________________________________

// maybeInput
// _____________________________________________________________________

// column
// _____________________________________________________________________

// maybeColumn
// _____________________________________________________________________

// labelof
// _____________________________________________________________________

expectType<string>(labelof("some label"));
expectType<string>(labelof(undefined, "fallback"));
expectType<string>(labelof(null, "fallback"));
expectType<undefined>(labelof(undefined));
expectType<undefined>(labelof(null));
expectType<string>(labelof({label: "my label"}, "fallback"));
expectType<string>(labelof({label: "my label"}));
expectError(() => labelof(1));

// mid
// _____________________________________________________________________

// maybeValue
// _____________________________________________________________________

// numberChannel
// _____________________________________________________________________

// isIterable
// _____________________________________________________________________

// isTextual
// _____________________________________________________________________

// isOrdinal
// _____________________________________________________________________

// isTemporalString
// _____________________________________________________________________

// isNumericString
// _____________________________________________________________________

// isNumeric
// _____________________________________________________________________

// isFirst
// _____________________________________________________________________

// isEvery
// _____________________________________________________________________

// isColor
// _____________________________________________________________________

// isNoneish
// _____________________________________________________________________

// isNone
// _____________________________________________________________________

// isRound
// _____________________________________________________________________

// maybeFrameAnchor
// _____________________________________________________________________

// order
// _____________________________________________________________________

// inherit
// _____________________________________________________________________

// Named
// _____________________________________________________________________

// maybeNamed
// _____________________________________________________________________
