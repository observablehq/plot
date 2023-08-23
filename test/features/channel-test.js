import * as Plot from "@observablehq/plot";
import assert from "assert";
import {JSDOM} from "jsdom";
const {
  window: {document}
} = new JSDOM("");

it("The difference channel domain sort option needs two channels", () => {
  assert.throws(() => Plot.dot([], {sort: {x: "height"}}).plot({document}), /^Error: missing channel: y1$/);
  assert.throws(
    () => Plot.dot([], {channels: {y1: "1"}, sort: {x: "height"}}).plot({document}),
    /^Error: missing channel: y2$/
  );
  assert.throws(() => Plot.dot([], {sort: {y: "width"}}).plot({document}), /^Error: missing channel: x1$/);
  assert.throws(
    () => Plot.dot([], {channels: {x1: "1"}, sort: {y: "width"}}).plot({document}),
    /^Error: missing channel: x2$/
  );
});

it("A invalid domain order is rejected", () => {
  assert.throws(() => Plot.dotY([0, 1], {sort: {y: {order: "neo"}}}).plot({document}), /^Error: invalid order: neo$/);
});
