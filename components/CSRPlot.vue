<template>
<div style="margin-top: 20px">
  <div :style="style"></div>
  <div v-html="source"></div>
</div>
</template>

<script>
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default {
  props: ["plot", "options", "mark", "height", "dataset"],
  data() {
    return {
      style: { height: (this.height ?? 480) + "px" }
    };
  },
  computed: {
   source(){
      /* todo marked (`~~~js\n${this.plot}\n~~~`); */
      return `<pre style="font-size:x-small;">${this.plot}`;
   }
 },
  mounted: async function () {
    const url = this.url || (this.dataset && "https://raw.githubusercontent.com/observablehq/plot/main/test/data/" + this.dataset);
    const data = url ? await d3.csv(url, d3.autoType) : [1, 2, 3];
    const a = eval(this.plot);
    if (a != null) this.$el.childNodes[0]?.replaceWith(a);
  }
};
</script>