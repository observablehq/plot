<script setup>
import {formatPrefix} from "d3-format";
import {data} from "./stargazers.data";
const formattedStarCount = data ? formatPrefix(".1s", 1000)(data) : "";
const formattedVersion = "v".concat(__APP_VERSION__);
</script>

<template>
  <a target="_blank" data-decoration="★" :title="formattedVersion" href="https://github.com/observablehq/plot/releases">
    <span>{{ formattedVersion }}</span>
  </a>
  <a target="_blank" data-decoration="★" :title="formattedStarCount" href="https://github.com/observablehq/plot">
    <span>GitHub️ {{ formattedStarCount }}</span>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_4126_49)">
        <path
          d="M7.08254 1.37658C7.43071 0.573728 8.56927 0.573726 8.91744 1.37658L10.4408 4.88936C10.5135 5.05695 10.6718 5.17156 10.8537 5.18832L14.6746 5.54023C15.5503 5.6209 15.903 6.71142 15.2402 7.28958L12.365 9.7979C12.2264 9.91879 12.1654 10.106 12.2061 10.2853L13.0494 14.0013C13.2435 14.8564 12.3216 15.5294 11.5663 15.0841L8.25395 13.1309C8.09725 13.0385 7.90273 13.0385 7.74603 13.1309L4.43366 15.0841C3.67841 15.5294 2.75648 14.8564 2.95054 14.0013L3.79391 10.2853C3.83461 10.106 3.77358 9.91879 3.635 9.7979L0.759735 7.28957C0.0969984 6.71142 0.449632 5.6209 1.32541 5.54024L5.14633 5.18832C5.32823 5.17156 5.48652 5.05695 5.5592 4.88936L7.08254 1.37658Z"
          fill="#EBC855"
        />
      </g>
      <defs>
        <clipPath id="clip0_4126_49">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </a>
</template>

<style scoped>
a {
  font-size: 14px;
  font-weight: 600;
  text-wrap: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0px 0.5rem;
  color: inherit;
}

a[target="_blank"] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
}

a[target="_blank"]:hover span {
  text-decoration: underline;
}

a[target="_blank"]::after {
  content: "\2197";
  color: var(--vp-c-text-2);
  font-weight: 400;
}

a[target="_blank"]:not(:hover, :focus)::after {
  color: var(--vp-c-text-3);
}
</style>
