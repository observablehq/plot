import {Runtime} from "@observablehq/runtime";
import {Library} from "@observablehq/stdlib";

async function importUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("unable to fetch");
  const source = await response.text();
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

export default {
  async load() {
    const {default: gallery} = await importUrl("https://api.observablehq.com/@observablehq/plot-gallery.js?v=4");
    const runtime = new Runtime(new Library());
    const module = runtime.module(gallery);
    const data = [];
    module.define("md", () => String.raw);
    module.redefine("previews", () => (chunk) => data.push(...chunk));
    const values = [];
    for (const output of module._resolve("previews")._outputs) {
      if (output._name) {
        values.push(module.value(output._name));
      }
    }
    await Promise.all(values);
    return data;
  }
};
