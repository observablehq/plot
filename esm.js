const {readFileSync} = require("fs");
const {Module} = require("module");

// https://github.com/standard-things/esm/issues/855
Module._extensions[".js"] = (module, filename) => {
  module._compile(readFileSync(filename, "utf8"), filename);
};
