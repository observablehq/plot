import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import tape from "tape-await";

tape("Plot uses the data.column accessor", test => {
  const columnChecks = [];
  const columnX = ["A", "B", "C", "D"];
  const columnY = [1, 1, 2];
  const data = {
    length: 5,
    column: function(field) {
      columnChecks.push(field);
      switch(field) {
        case "x": return columnX;
        case "y": return columnY;
      } 
    },
    *[Symbol.iterator] () {
      /* eslint require-yield: 0 */
      throw new Error("The iterator should not be called");
    }
  };
  const A = Plot.dot(data, {x: "x", y: "y"}).initialize();
  test.deepEqual(A.index, d3.range(data.length));
  test.deepEqual(columnChecks, ["x", "y"]);
  test.strictEqual(A.channels.find(([c]) => c === "x")[1].value, columnX);
  test.strictEqual(A.channels.find(([c]) => c === "y")[1].value, columnY);
});
