import {readdir, readFile, stat} from "fs/promises";

// Anchors can be derived from headers, or explicitly written as {#names}.
export function getAnchors(text) {
  const anchors = [];
  for (const [, header] of text.matchAll(/^#+ ([*\w][*().,\w\d -]+)\n/gm)) {
    anchors.push(
      header
        .replaceAll(/[^\w\d\s]+/g, " ")
        .trim()
        .replaceAll(/ +/g, "-")
        .toLowerCase()
    );
  }
  for (const [, anchor] of text.matchAll(/ \{#([\w\d-]+)\}/g)) {
    anchors.push(anchor);
  }
  return anchors;
}

// Internal links.
export function getLinks(file, text) {
  const links = [];
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const [, link] = match;
    if (/^\w+:/.test(link)) continue; // absolute link with protocol
    const {pathname, hash} = new URL(link, new URL(file, "https://example.com/"));
    links.push({pathname, hash});
  }
  return links;
}

// In source files, ignore comments.
export async function readMarkdownSource(f) {
  return (await readFile(f, "utf8")).replaceAll(/<!-- .*? -->/gs, "");
}

// Recursively find all md files in the directory.
export async function* readMarkdownFiles(root, subpath = "/") {
  for (const fname of await readdir(root + subpath)) {
    if (fname.startsWith(".") || fname.endsWith(".js")) continue; // ignore .vitepress etc.
    if ((await stat(root + subpath + fname)).isDirectory()) yield* readMarkdownFiles(root, subpath + fname + "/");
    else if (fname.endsWith(".md")) yield subpath + fname;
  }
}
