import {facetReindex} from "../../src/facet.js";
import assert from "assert";
import {range} from "../../src/options.js";

it("facetReindex handles large indices (n => 2n)", () => {
  const n = 1000000;
  const data = range({length: n});
  const facets = Array.from(data, (_, i) => data.subarray(i, i + 2));
  const r = facetReindex(facets, data, {x: {value: data}});
  assert.strictEqual(r.facets.length, facets.length);
  assert.strictEqual(r.facets[facets.length - 1].length, 1);
  assert.strictEqual(r.facets[facets.length - 1][0], 2 * (n - 1));
  assert.strictEqual(r.data.length, 2 * n - 1);
  assert.strictEqual(r.data[2 * n - 2], n - 1);
  assert.strictEqual(r.channels.x.value(undefined, 2 * n - 2), n - 1);
});

it("facetReindex handles large indices (n => n^2)", () => {
  const n = 1000; // note: fails for n > 46340 ()= sqrt(2**31)) due to combinatorial expansion
  const data = range({length: n});
  const facets = Array.from(data, (_, i) => data.subarray(0, i + 1));
  const r = facetReindex(facets, data, {x: {value: data}});
  const nn12 = (n * (n + 1)) >> 1;
  assert.strictEqual(r.facets.length, facets.length);
  assert.strictEqual(r.facets[facets.length - 1].length, facets.length);
  assert.strictEqual(r.facets[facets.length - 1][0], nn12 - n + 1);
  assert.strictEqual(r.data.length, nn12);
  assert.strictEqual(r.data[nn12 - 1], n - 2);
  assert.strictEqual(r.channels.x.value(undefined, nn12 - 1), n - 2);
});
