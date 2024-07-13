import {creator, select} from "d3";
import {maybeClip} from "./options.js";

export function createContext(options = {}) {
  const {document = typeof window !== "undefined" ? window.document : undefined, clip} = options;
  return {document, clip: maybeClip(clip)};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
