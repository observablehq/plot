import {creator, geoPath, select} from "d3";
import {maybeClip} from "./options.js";
import {xyProjection} from "./projection.js";

export function createContext(options = {}, scales) {
  const {document = typeof window !== "undefined" ? window.document : undefined, clip} = options;
  return {
    document,
    clip: maybeClip(clip),
    path() {
      return geoPath(this.projection ?? (scales && xyProjection(scales)));
    }
  };
}

export function create(name, {document}) {
  return select(creator(name).call(document.documentElement));
}
