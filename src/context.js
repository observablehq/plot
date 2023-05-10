import {creator, select} from "d3";

export function createContext(options = {}) {
  const {document = typeof window !== "undefined" ? window.document : undefined} = options;
  return {document};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
