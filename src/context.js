import {creator, select} from "d3";
import {createProjection} from "./projection.js";

export function createContext(options = {}, dimensions, className) {
  const {document = typeof window !== "undefined" ? window.document : undefined} = options;
  const ownerSVGElement = creator("svg").call(document.documentElement);
  const projection = createProjection(options, dimensions);
  return {document, ownerSVGElement, className, projection};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
