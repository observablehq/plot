import * as Plot from "@observablehq/plot";
import {assert, it} from "vitest";

it("mark(data, {sort}) needs y1 and y2 when sorting by height", () => {
  assert.throws(() => Plot.dot([], {sort: {x: "height"}}).plot(), /missing channel: y1$/);
  assert.throws(() => Plot.dot([], {channels: {y1: "1"}, sort: {x: "height"}}).plot(), /missing channel: y2$/);
});

it("mark(data, {sort}) needs x1 and x2 when sorting by width", () => {
  assert.throws(() => Plot.dot([], {sort: {y: "width"}}).plot(), /missing channel: x1$/);
  assert.throws(() => Plot.dot([], {channels: {x1: "1"}, sort: {y: "width"}}).plot(), /missing channel: x2$/);
});

it("mark(data, {sort}) rejects an invalid order", () => {
  assert.throws(() => Plot.dotY([0, 1], {sort: {y: {value: "x", order: "neo" as any}}}).plot(), /invalid order: neo$/); // prettier-ignore
});
