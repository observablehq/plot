import type {Context} from "./api.js";
import {creator, select} from "d3";

export function Context({document = window.document} = {}) {
  return {document};
}

export function create(name: string, {document}: Context) {
  return select(creator(name).call(document.documentElement));
}
