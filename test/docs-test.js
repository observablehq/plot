import assert from "assert";
import {readMarkdownFiles, readMarkdownSource, getAnchors, getLinks} from "../docs/components/links.js";

it("documentation links point to existing internal anchors", async () => {
  const root = "docs";

  // Crawl all files, read their links and anchors.
  const anchors = new Map();
  const links = [];
  for await (const file of readMarkdownFiles(root)) {
    const text = await readMarkdownSource(root + file);
    anchors.set(file, getAnchors(text));
    for (const {pathname, hash} of getLinks(file, text)) {
      links.push({source: file, target: pathname, hash});
    }
  }

  // Check for broken links.
  let errors = [];
  for (let {source, target, hash} of links) {
    if (!target.endsWith(".md")) {
      errors.push(`- ${source} points to ${target} instead of ${target}.md.`);
      target += ".md";
    }

    if (!hash || anchors.get(target).includes(hash.slice(1))) continue;
    errors.push(`- ${source} points to missing ${target}${hash}.`);
  }
  assert(errors.length === 0, new Error(`${errors.length} broken links:\n${errors.join("\n")}`));
});
