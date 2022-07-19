import {creator, select} from "d3";

interface IContext {
  document: Document;
}

export function Context({document = window.document} = {}): IContext {
  return {document};
}

export function create(name: string, {document}: IContext) {
  return select(creator(name).call(document.documentElement));
}
