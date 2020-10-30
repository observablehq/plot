const Plot = require("../");
const tape = require("tape-await");

tape("exports Frame", test => {
  test.ok(Object.keys(Plot).includes("Frame"));
});
