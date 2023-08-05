<script setup>

const {version} = defineProps(["version"]);

</script>
<template>
  <Badge type="tip">
    <a :href="`https://github.com/observablehq/plot/releases/tag/v${version}`" :title="`added in v${version}`" target="_blank" rel="external" style="color: inherit;">
      ^{{ version }}
    </a>
  </Badge>
</template>
