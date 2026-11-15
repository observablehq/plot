/* eslint-disable @typescript-eslint/ban-ts-comment */

import {it} from "vitest";
import * as Plot from "@observablehq/plot";

it("arrow-reverse is a valid marker and markerStart", () => {
  Plot.link([], {marker: "arrow-reverse"});
  Plot.link([], {markerStart: "arrow-reverse"});
  Plot.line([], {marker: "arrow-reverse", markerEnd: "arrow"});
});

it("arrow-reverse is not a valid markerMid or markerEnd", () => {
  // @ts-expect-error
  Plot.link([], {markerMid: "arrow-reverse"});
  // @ts-expect-error
  Plot.link([], {markerEnd: "arrow-reverse"});
  // @ts-expect-error
  Plot.line([], {markerEnd: "arrow-reverse"});
});
