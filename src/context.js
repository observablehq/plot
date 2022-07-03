import {creator, select} from "d3";

export function Context({document = window.document} = {}) {
  return {document};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
