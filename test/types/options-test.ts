import {expectError, expectType} from "tsd";
import {Value, ValueArray} from "../../src/data.js";
import {
  constant,
  field,
  identity,
  labelof,
  maybeColorChannel,
  maybeKeyword,
  maybeNumberChannel,
  percentile,
  TransformMethod,
  ValueAccessor,
  valueof
} from "../../src/options.js";

// valueof
// _____________________________________________________________________

const numberTransform: TransformMethod<number> = {
  transform: (data) => (data ? Array.from(data, (d) => d + 1) : [])
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nullTransform: TransformMethod<any> = {
  transform: () => [1, 2, 3]
};

expectType<ValueArray>(valueof({length: 10}, (d, i) => i));
expectType<ValueArray>(valueof([1, 2, 3], numberTransform));
expectType<ValueArray>(valueof([1, 2, 3], nullTransform));
expectType<ValueArray>(valueof({length: 10}, nullTransform));
expectType<ValueArray>(valueof([{one: "one", two: "two"}], "one"));
expectType<Date[]>(valueof({length: 10}, new Date()));
expectType<undefined>(valueof(undefined, (_, i) => i + 10));
expectType<undefined>(valueof(undefined, nullTransform));
expectType<null>(valueof(null, nullTransform));
expectType<number[]>(valueof({length: 10}, 1));
expectType<boolean[]>(valueof({length: 10}, true));
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
expectType<ValueArray>(valueof([1, 2, 3], (d) => d * 2, Array)); // <-- is this what we expect?

// @ts-expect-error: can't do a number transform on "one"
expectError(() => valueof(["one", 2, 3], numberTransform));
// @ts-expect-error: red is not one of the keys, and valueof doesn't support colors
expectError(() => valueof([{one: "one", two: "two"}], "red"));
// @ts-expect-error: red is not one of the keys, and valueof doesn't support colors
expectType<null>(valueof(null, "red"));

// field
// _____________________________________________________________________

expectType<Value>(field("key")({key: "value"}));
expectType<Value>(field("foo")({key: "value"}));

// identity
// _____________________________________________________________________

expectType<ValueArray>(identity.transform([2, 3, 4]));
expectType<ValueArray>(identity.transform(null)); // :(
expectType<ValueArray>(identity.transform(undefined)); // :(

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

expectType<[ValueAccessor<string>, undefined] | [undefined, string]>(maybeColorChannel("red"));
expectType<[ValueAccessor<string>, undefined] | [undefined, string]>(maybeColorChannel(1));

// maybeNumberChannel
// _____________________________________________________________________

expectType<[ValueAccessor<number>, undefined] | [undefined, number | null]>(maybeNumberChannel("red"));
expectType<[ValueAccessor<number>, undefined] | [undefined, number | null]>(maybeNumberChannel(1));

// maybeKeyword
// _____________________________________________________________________

expectType<undefined>(maybeKeyword(null, "foo", ["bar"]));
expectType<undefined>(maybeKeyword(undefined, "foo", ["bar"]));
expectType<string | undefined>(maybeKeyword("bar", "foo", ["bar"]));

// keyword
// _____________________________________________________________________

// arrayify
// _____________________________________________________________________

// map
// _____________________________________________________________________

// slice
// _____________________________________________________________________

// maybeZero
// _____________________________________________________________________

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
expectType<string>(labelof({label: "my label"}));

// @ts-expect-error: expected
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
