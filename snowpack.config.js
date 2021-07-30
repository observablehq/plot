export default {
  alias: {
    "@observablehq/plot": "./src/index.js"
  },
  devOptions: {
    port: 8008
  },
  mount: {
    "src": "/dist",
    "test/data": "/data",
    "test/plots": "/"
  }
};
