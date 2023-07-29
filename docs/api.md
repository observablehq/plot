<script setup>

import {data} from "./data/api.data";

</script>

# API index

## Methods

<ul :class="$style.oneline">
  <li v-for="({name, href, comment}) in data.methods">
    <span><a :href="href">{{ name }}</a> - {{ comment }}</span>
  </li>
</ul>

## Options

<ul>
  <li v-for="[name, contexts] in data.options">
    <b>{{ name }}</b> - <span v-for="({name, href}, index) in contexts"><a :href="href">{{ name }}</a><span v-if="index < contexts.length - 1">, </span></span>
  </li>
</ul>

<style module>

ul.oneline span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
