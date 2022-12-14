import {creator, select} from "d3";
import {Projection} from "./projection.js";

export function Context(options = {}, dimensions) {
  const {
    document = typeof window !== "undefined" ? window.document : undefined,
    devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1
  } = options;
  return {document, devicePixelRatio, projection: Projection(options, dimensions)};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
