import assert from "node:assert";
import * as Arrow from "apache-arrow";
import {valueof} from "../src/index.js";

describe("valueof(data, value, type)", () => {
  it("allows data to be an Arrow Table", () => {
    const data = Arrow.tableFromArrays({a: [1, 2, 3], b: Int32Array.of(4, 5, 6), c: "abc"});
    assert.deepStrictEqual(valueof(data, "a"), Float64Array.of(1, 2, 3));
    assert.deepStrictEqual(valueof(data, "b"), Int32Array.of(4, 5, 6));
    assert.deepStrictEqual(valueof(data, "c"), ["a", "b", "c"]);
  });
  it("allows data to be an Arrow Table, returning null if the column doesn’t exist", () => {
    const data = Arrow.tableFromArrays({a: [1, 2, 3], b: Int32Array.of(4, 5, 6), c: "abc"});
    assert.deepStrictEqual(valueof(data, "unknown"), null);
    assert.deepStrictEqual(valueof(data, "unknown", Array), null);
    assert.deepStrictEqual(valueof(data, "unknown", Float64Array), null);
  });
  it("allows value to be an Arrow Vector, ignoring data", () => {
    const data = Arrow.tableFromArrays({a: [1, 2, 3], b: Int32Array.of(4, 5, 6), c: "abc"});
    assert.deepStrictEqual(valueof(null, data.getChild("a")), Float64Array.of(1, 2, 3));
    assert.deepStrictEqual(valueof(null, data.getChild("b")), Int32Array.of(4, 5, 6));
    assert.deepStrictEqual(valueof(null, data.getChild("c")), ["a", "b", "c"]);
  });
  it("returns an array of Date for Arrow Date types, when not specifying a type", () => {
    const dates = [2000, 2001, 2002].map((y) => new Date(`${y}`));
    const data = Arrow.tableFromArrays({dates});
    assert.deepStrictEqual(valueof(data, "dates"), dates);
    assert.deepStrictEqual(valueof(null, data.getChild("dates")), dates);
  });
  it("returns an array of Date for Arrow Date types, when asking for an Array", () => {
    const dates = [2000, 2001, 2002].map((y) => new Date(`${y}`));
    const data = Arrow.tableFromArrays({dates});
    assert.deepStrictEqual(valueof(data, "dates", Array), dates);
    assert.deepStrictEqual(valueof(null, data.getChild("dates"), Array), dates);
  });
  it("returns a typed array for Arrow Date types, when asking for a typed array", () => {
    const dates = [2000, 2001, 2002].map((y) => new Date(`${y}`));
    const floats = Float64Array.from(dates);
    const bigints = BigInt64Array.from(floats, BigInt);
    const data = Arrow.tableFromArrays({dates});
    assert.deepStrictEqual(valueof(data, "dates", Float64Array), floats);
    assert.deepStrictEqual(valueof(null, data.getChild("dates"), Float64Array), floats);
    assert.deepStrictEqual(valueof(data, "dates", BigInt64Array), bigints);
    assert.deepStrictEqual(valueof(null, data.getChild("dates"), BigInt64Array), bigints);
  });
});
