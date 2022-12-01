import {creator, select} from "d3";
import {Projection} from "./projection.js";

export function Context(options = {}, dimensions) {
  const {document = typeof window !== "undefined" ? window.document : undefined} = options;
  return {document, projection: Projection(options, dimensions)};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
