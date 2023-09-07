import * as Plot from "@observablehq/plot";

export async function treeDelimiter() {
  return Plot.plot({
    axis: null,
    height: 120,
    margin: 10,
    marginLeft: 40,
    marginRight: 190,
    marks: [
      Plot.tree(
        [
          "foo;bar;https://example.com",
          "foo;bar;https://example.com/posts/1",
          "foo;baz;https://example.com/posts/2",
          "foo;bar\\;baz;https://example2.com", // “bar;baz” should be a single node
          "foo;bar/baz;https://example4.com", // "bar/baz" should be a single node, distinct from “bar;baz”
          "foo;bar\\/baz;https://example3.com" // “bar\/baz” should be a single node
        ],
        {delimiter: ";"}
      )
    ]
  });
}

export async function treeDelimiter2() {
  return Plot.plot({
    axis: null,
    height: 120,
    margin: 10,
    marginLeft: 40,
    marginRight: 190,
    marks: [
      Plot.tree(
        [
          "foo/bar/https:\\/\\/example.com",
          "foo/bar/https:\\/\\/example.com\\/posts\\/1",
          "foo/baz/https:\\/\\/example.com\\/posts\\/2",
          "foo/bar;baz/https:\\/\\/example2.com", // “bar;baz” should be a single node
          "foo/bar\\/baz/https:\\/\\/example4.com", // "bar/baz" should be a single node, distinct from “bar;baz”
          "foo/bar\\\\\\/baz/https:\\/\\/example3.com" // “bar\/baz” should be a single node
        ]
      )
    ]
  });
}
