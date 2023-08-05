<script setup>

const {version, pr} = defineProps(["version", "pr"]);

</script>
<template>
  <Badge v-if="version || pr" :type="version ? `tip` : `warning`">
    <a :href="version ? `https://github.com/observablehq/plot/releases/tag/v${version}` : `https://github.com/observablehq/plot/pull/${pr}`" :title="version ? `added in v${version}` : `added in #${pr}`" target="_blank" rel="external" style="color: inherit;">
      {{ version ? `^${version}` : "prerelease" }}
    </a>
  </Badge>
</template>
