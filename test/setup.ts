import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {vi} from "vitest";

// Mock fetch to load local test data files.
vi.stubGlobal("fetch", async function fetch(path: string) {
  return new Response(await readFile(resolve("./test", path)));
});

// JSDOM doesn't implement getBBox; stub it to avoid uncaught errors from
// postrender callbacks (e.g., tip marks using requestAnimationFrame).
if (SVGElement.prototype["getBBox"] === undefined) {
  SVGElement.prototype["getBBox"] = function getBBox() {
    return {x: 0, y: 0, width: 0, height: 0};
  };
}
