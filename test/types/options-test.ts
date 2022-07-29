import {expectError, expectType} from "tsd";
import {ValueArray} from "../../src/data.js";
import {
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

const nullTransform: TransformMethod<number> = {
  transform: () => [1, 2, 3]
};

expectType<null>(valueof(null, "red"));
expectType<undefined>(valueof(undefined, (_, i) => i + 10));
expectType<ValueArray | null | undefined>(valueof({length: 10}, (d, i) => i));
expectType<ValueArray | null | undefined>(valueof([1, 2, 3], numberTransform));
expectType<ValueArray | null | undefined>(valueof([1, 2, 3], nullTransform));
expectType<ValueArray | null | undefined>(valueof(null, nullTransform));
expectType<ValueArray | null | undefined>(valueof(undefined, nullTransform));
expectType<ValueArray | null | undefined>(valueof({length: 10}, nullTransform));
valueof([{one: "one", two: "two"}], (d) => {
  expectType<{one: string; two: string}>(d);
  return d.one;
});
valueof([true, false], (d) => {
  expectType<boolean>(d);
  return d;
});

// @ts-expect-error: expected
expectError(() => valueof(["one", 2, 3], numberTransform));

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
