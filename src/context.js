import {creator, select} from "d3";
import {maybeProjection} from "./projection.js";

export function Context(
  {document = typeof window !== "undefined" ? window.document : undefined, projection} = {},
  dimensions
) {
  return {document, projection: maybeProjection(projection, dimensions)};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
