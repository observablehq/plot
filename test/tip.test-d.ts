/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as Plot from "@observablehq/plot";
import {it} from "vitest";

it("a nested tip option is not allowed", () => {
  // @ts-expect-error
  Plot.dot([], {x: 0, y: 0, tip: {tip: true}});
});

it("Plot.tip does not accept a tip option", () => {
  // @ts-expect-error
  Plot.tip([], {x: 0, y: 0, tip: true});
});
