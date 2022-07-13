import {creator, select} from "d3";

export function Context({document = window.document} = {}, axes) {
  return {axes, document};
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
