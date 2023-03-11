import {creator, select} from "d3";
import {createProjection} from "./projection.js";

export function createContext(options = {}, dimensions) {
  const {document = typeof window !== "undefined" ? window.document : undefined} = options;
  return {document, projection: createProjection(options, dimensions)};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
