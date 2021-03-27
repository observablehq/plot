import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("groupX respects the domain option (#255)", test => {
  const data = ["A", "A", "C"];
  const options = {x: d => d, domain: ["C", "B", "A"]};
  const mark = Plot.dot(data, Plot.groupX({y: "count"}, options));
  const A = mark.initialize();
  test.deepEqual(A.index, [0, 1, 2]);
  test.deepEqual(A.channels.find(d => d[0] === "x")[1].value, ["C", "B", "A"]);
  test.deepEqual(A.channels.find(d => d[0] === "y")[1].value, [1, 0, 2]);
});

tape("groupY respects the domain option (#255)", test => {
  const data = ["A", "A", "C"];
  const options = {x: d => d, domain: ["C", "B", "A"]};
  const mark = Plot.dot(data, Plot.groupY({x: "count"}, options));
  const A = mark.initialize();
  test.deepEqual(A.index, [0, 1, 2]);
  test.deepEqual(A.channels.find(d => d[0] === "y")[1].value, ["C", "B", "A"]);
  test.deepEqual(A.channels.find(d => d[0] === "x")[1].value, [1, 0, 2]);
});

tape("group respects the domain option (#255)", test => {
  const data = ["A", "A", "C", "A", "C"];
  const options = {x: d => d, y: d => d, domain: ["C", "B", "A"]};
  const mark = Plot.dot(data, Plot.group({r: "count"}, options));
  const A = mark.initialize();
  test.deepEqual(A.index, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  test.deepEqual(A.channels.find(d => d[0] === "r")[1].value, [
  //C, B, A
    2, 0, 0, // C
    0, 0, 0, // B
    0, 0, 3  // A
  ]);
});
