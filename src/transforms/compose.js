import {arrayify} from "../mark.js";

export function composeTransform(t1, t2) {
  if (t1 == null) return t2 === null ? undefined : t2;
  if (t2 == null) return t1 === null ? undefined : t1;
  return (data, facets) => {
    ({data, facets} = t1(data, facets));
    return t2(arrayify(data), facets);
  };
}
