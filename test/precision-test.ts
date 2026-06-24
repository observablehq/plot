import assert from "assert";
import {scale as createScale} from "../src/index.js";
import {pixelRound} from "../src/precision.js";
import type {MaterializedScale} from "../src/precision.js";

// pixelRound expects a d3-like scale; Plot.scale() returns plain arrays
// and a separate apply function.
function scale(options: any): MaterializedScale {
  const {type, domain, range, apply, invert} = createScale({x: {range: [0, 600], ...options}}) as any;
  return Object.assign(apply, {type, domain: () => domain, range: () => range, invert});
}

function assertDistinct(s: MaterializedScale, label = "") {
  const round = pixelRound(s);
  const [r0, r1] = s.range();
  const lo = Math.min(r0, r1);
  const hi = Math.max(r0, r1);
  let prev = +round(s.invert(lo));
  for (let p = lo + 1; p < hi; ++p) {
    const v = +round(s.invert(p));
    assert.notStrictEqual(prev, v, `${label}pixels ${p - 1} and ${p} should map to distinct values`);
    prev = v;
  }
}

describe("pixelRound", () => {
  it("rounds to integer for identity scales", () => {
    const round = pixelRound({type: "identity"} as any);
    assert.strictEqual(round(42.7), 43);
    assert.strictEqual(round(42.3), 42);
  });

  it("returns identity for a zero-pixel range", () => {
    const round = pixelRound(scale({type: "linear", domain: [0, 100], range: [0, 0]}));
    assert.strictEqual(round(42), 42);
  });

  it("always returns a round function", () => {
    for (const s of [
      scale({type: "linear", domain: [0, 100]}),
      scale({type: "utc", domain: [new Date("2020-01-01"), new Date("2025-01-01")]}),
      scale({type: "log", domain: [1, 1000], range: [0, 300]}),
      scale({type: "symlog", domain: [0, 1000], range: [0, 500]})
    ]) {
      const floor = pixelRound(s);
      assert.strictEqual(typeof floor, "function", `expected function for ${s.type}`);
    }
  });

  describe("linear scales", () => {
    it("rounds to a nice step", () => {
      const round = pixelRound(scale({type: "linear", domain: [0, 100], range: [0, 500]}));
      assert.strictEqual(round(38.87), 38.9);
    });
    it("produces clean floating point values", () => {
      const round = pixelRound(scale({type: "linear", domain: [0, 100], range: [0, 500]}));
      assert.strictEqual(round(38.8), 38.8);
      assert.strictEqual(round(0.3), 0.3);
    });
    it("handles reversed domains", () => {
      const floor = pixelRound(scale({type: "linear", domain: [100, 0], range: [0, 500]}));
      assert.strictEqual(typeof floor, "function");
    });
    it("guarantees distinct values for neighboring pixels", () => {
      assertDistinct(scale({type: "linear", domain: [0, 100], range: [0, 500]}));
    });
  });

  describe("temporal scales", () => {
    it("5 years / 600px rounds to midnight", () => {
      const round = pixelRound(scale({type: "utc", domain: [new Date("2020-01-01"), new Date("2025-01-01")]}));
      const d = round(new Date("2023-06-15T14:30:00Z"));
      assert.strictEqual(d.getUTCHours(), 0);
      assert.strictEqual(d.getUTCMinutes(), 0);
    });
    it("1 month / 600px rounds to whole minutes", () => {
      const round = pixelRound(scale({type: "utc", domain: [new Date("2020-01-01"), new Date("2020-02-01")]}));
      const d = round(new Date("2020-01-15T14:30:00Z"));
      assert.strictEqual(d.getUTCSeconds(), 0);
    });
    it("1 hour / 600px rounds to whole seconds", () => {
      const round = pixelRound(
        scale({type: "utc", domain: [new Date("2020-01-01T00:00Z"), new Date("2020-01-01T01:00Z")]})
      );
      const d = round(new Date("2020-01-01T00:30:15.789Z"));
      assert.strictEqual(d.getUTCMilliseconds(), 0);
    });
    it("precision gets finer as the domain shrinks", () => {
      const wide = pixelRound(scale({type: "utc", domain: [new Date("2000-01-01"), new Date("2025-01-01")]}));
      const narrow = pixelRound(scale({type: "utc", domain: [new Date("2020-01-01"), new Date("2020-02-01")]}));
      const d = new Date("2020-01-15T14:30:45Z");
      assert.ok(Math.abs(+d - +wide(d)) >= Math.abs(+d - +narrow(d)));
    });
    it("guarantees distinct values for neighboring pixels", () => {
      const cases: [Date, Date, number][] = [
        [new Date("2020-01-01"), new Date("2025-01-01"), 600], // 5 years / 600px
        [new Date("2020-01-01"), new Date("2020-02-01"), 600], // 1 month / 600px
        [new Date("2020-01-01T00:00Z"), new Date("2020-01-01T01:00Z"), 600], // 1 hour / 600px
        [new Date("2020-02-01"), new Date("2020-03-01"), 29], // leap February / 29px
        [new Date("2021-02-01"), new Date("2021-03-01"), 29], // non-leap February / 29px
        [new Date("2025-01-01"), new Date("2020-01-01"), 600], // inverted domain
        [new Date("2020-01-01"), new Date("2025-01-01"), -600], // inverted range
        [new Date("2025-01-01"), new Date("2020-01-01"), -600] // inverted domain and range
      ];
      for (const [d0, d1, r1] of cases) {
        assertDistinct(scale({type: "utc", domain: [d0, d1], range: [0, r1]}), `utc ${d0}–${d1}@${r1}px: `);
      }
    });
    it("guarantees distinct values for neighboring pixels (local time)", () => {
      // US DST spring-forward: March 8, 2020 is a 23h day in America/Los_Angeles
      const d0 = new Date("2020-03-08T00:00:00-08:00"); // midnight PST
      const d1 = new Date("2020-03-09T00:00:00-07:00"); // midnight PDT
      assertDistinct(scale({type: "time", domain: [d0, d1], range: [0, 720]}), "DST spring-forward@720px: ");
    });
  });

  describe("log scales", () => {
    it("precision gets coarser toward the sparse end", () => {
      const s = scale({type: "log", domain: [1, 1000], range: [0, 300]});
      const floor = pixelRound(s);
      const v0 = floor(1.5);
      const v299 = floor(950.5);
      assert.ok(v0 === 1.5 || Math.abs(v0 - 1.5) < 0.1, `near start: ${v0}`);
      assert.ok(Math.abs(v299 - 950.5) >= 0.1, `near end should be coarser: ${v299}`);
    });
    it("guarantees distinct values for neighboring pixels", () => {
      assertDistinct(scale({type: "log", domain: [1, 1000], range: [0, 300]}));
    });
    it("works across a wide domain", () => {
      assertDistinct(scale({type: "log", domain: [0.000001, 10000]}));
    });
  });

  describe("pow scales", () => {
    it("guarantees distinct values for neighboring pixels", () => {
      assertDistinct(scale({type: "pow", exponent: 2, domain: [0, 100], range: [0, 500]}));
    });
    it("handles steep exponent", () => {
      assertDistinct(scale({type: "pow", exponent: 4, domain: [0, 10]}));
    });
  });

  describe("sqrt scales", () => {
    it("guarantees distinct values for neighboring pixels", () => {
      assertDistinct(scale({type: "sqrt", domain: [0, 10000], range: [0, 400]}));
    });
  });

  describe("symlog scales", () => {
    it("guarantees distinct values for neighboring pixels", () => {
      assertDistinct(scale({type: "symlog", domain: [-100000, 100000], range: [0, 580]}));
    });
    it("handles narrow range near zero", () => {
      assertDistinct(scale({type: "symlog", domain: [-10, 10], range: [0, 200]}));
    });
  });
});
