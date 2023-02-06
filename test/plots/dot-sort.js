import * as Plot from "@observablehq/plot";
import {html} from "htl";

export default async function () {
  const x = [..."ABDCEFGH"];
  const r = [30, 60, 20, 20, 35, 22, 20, 28];
  const options = {x, r, stroke: "black", fill: x, fillOpacity: 0.8};
  const p = {width: 300, axis: null, r: {type: "identity"}, x: {inset: 50}, margin: 0};
  return html`
    ${Plot.dot(x, options).plot({...p, caption: "default sort (r desc)"})}
    <br />
    ${Plot.dot(x, {...options, sort: r}).plot({...p, caption: "sort by r"})}
    <br />
    ${Plot.dot(x, {...options, sort: null}).plot({...p, caption: "null sort"})}
    <br />
    ${Plot.dot(x, Plot.reverse(options)).plot({...p, caption: "reverse"})}
    <br />
    ${Plot.dot(
      x,
      Plot.sort((d) => d, options)
    ).plot({...p, caption: "sort by x"})}
    <br />
    ${Plot.dot(x, Plot.reverse(Plot.sort((d) => d, options))).plot({...p, caption: "reverse sort by x"})}
    <br />
    ${Plot.dot(x, Plot.shuffle({...options, seed: 42})).plot({...p, caption: "shuffle"})}
  `;
}
