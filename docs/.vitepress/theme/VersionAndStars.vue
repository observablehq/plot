<script setup>
import {formatPrefix} from "d3-format";
import {data} from "./stargazers.data";
const formattedStarCount = data ? formatPrefix(".1s", 1000)(data) : "";
const version = __APP_VERSION__;
</script>

<template>
  <a target="_blank" :title="version.concat(' release notes')" href="https://github.com/observablehq/plot/releases">
    <span>{{ version }}</span>
  </a>
  <a target="_blank" data-decoration="&#x2605;" :title="data.toLocaleString('en-US').concat(' GitHub stars')" href="https://github.com/observablehq/plot">
    <span>GitHub️ {{ formattedStarCount }}</span>
  </a>
</template>

<style scoped>
a {
  font-size: 14px;
  font-weight: 500;
  text-wrap: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  _color: inherit;
}

a[target="_blank"] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
}

a[target="_blank"]:hover span {
  text-decoration: underline;
  color: var(--vp-c-brand);
}

a[target="_blank"][data-decoration]::after {
  content: attr(data-decoration);
  color: var(--vp-c-brand);
}

a[target="_blank"]:not(:hover, :focus)::after {
  color: inherit;
}
</style>
