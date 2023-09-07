import * as Plot from "@observablehq/plot";

export async function treeDelimiter() {
  return Plot.plot({
    axis: null,
    height: 100,
    margin: 10,
    marginLeft: 40,
    marginRight: 190,
    marks: [
      Plot.tree(
        [
          "foo;bar;http://www.example.com",
          "foo;bar;https://www.example.com/posts/1",
          "foo;baz;https://www.example.com/posts/2"
        ],
        {delimiter: ";"}
      )
    ]
  });
}
