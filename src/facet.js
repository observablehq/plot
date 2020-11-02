import {group} from "d3-array";

export function Facet(I, FX, FY, render) {
  return FX && FY ? facetXY(I, FX, FY, render)
    : FX ? facetX(I, FX, render)
    : FY ? facetY(I, FY, render)
    : facet(I, render);
}

function facetXY(I, FX, FY, render) {
  I = group(I, i => FX[i], i => FY[i]);
  return (x, y, d, fx, fy) => render(I.get(fx).get(fy), x, y, d);
}

function facetX(I, FX, render) {
  I = group(I, i => FX[i]);
  return (x, y, d, fx) => render(I.get(fx), x, y, d);
}

function facetY(I, FY, render) {
  I = group(I, i => FY[i]);
  return (x, y, d, fx, fy) => render(I.get(fy), x, y, d);
}

function facet(I, render) {
  return (x, y, d) => render(I, x, y, d);
}
