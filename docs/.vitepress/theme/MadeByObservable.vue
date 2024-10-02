<script setup>
import {onMounted} from "vue";

const iconDownCaret = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.41435 6.53148C4.6731 6.20803 5.14507 6.15559 5.46852 6.41435L8.125 8.53953L10.7815 6.41435C11.1049 6.15559 11.5769 6.20803 11.8356 6.53148C12.0944 6.85492 12.042 7.32689 11.7185 7.58565L8.125 10.4605L4.53148 7.58565C4.20803 7.32689 4.15559 6.85492 4.41435 6.53148Z"
    fill="currentColor"
  />
</svg>`;
const iconClose = `<svg
    width="16"
    height="16"
    viewBox="0 0 10 16"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 4L9 12M9 4L1 12" />
</svg>`;

function is_touch_enabled() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

const isMobile = window.matchMedia("(max-width: 640px)");

isMobile.addEventListener("change", (e) => {
  renderButton(false, e.matches);
});

function renderButton(open, isMobile) {
  const buttonText = document.querySelector(".made-by-observable > .button > div.button-text");
  const buttonIcon = document.querySelector(".made-by-observable > .button > div.icon");
  if (!buttonText || !buttonIcon) {
    return;
  }
  if (open) {
    buttonText.style.display = "none";
    buttonIcon.innerHTML = iconClose;
    buttonIcon.style.paddingRight = "0px";
  } else {
    buttonText.style.display = "block";
    buttonText.innerHTML = isMobile ? "Observable" : "Made by Observable";
    buttonIcon.innerHTML = iconDownCaret;
    buttonIcon.style.paddingRight = "8px";
  }
}

onMounted(() => {
  renderButton(false, isMobile.matches);
});

function onClick() {
  if (!is_touch_enabled()) {
    return;
  }
  const popup = document.querySelector(".made-by-observable > .popup");
  if (!popup.style.display || popup.style.display === "none") {
    popup.style.display = "block";
    renderButton(true, isMobile.matches);
  } else {
    popup.style.display = "none";
    renderButton(false, isMobile.matches);
  }
}
</script>

<template>
  <div class="made-by-observable">
    <div class="button" @click="onClick()">
      <div class="button-text" />
      <div class="icon" />
    </div>
    <div class="popup">
      <div class="popup-wrapper">
        <div class="popup-header">Observable platform</div>
        <div class="popup-content">
          <div>
            <a class="section" href="https://observablehq.com/cloud/">
              <h2>Observable Cloud</h2>
              The only development and hosting environment made exclusively for Observable Framework apps
            </a>
            <a class="section" href="https://observablehq.com/documentation/notebooks/">
              <h2>Observable Notebooks</h2>
              Experiment and prototype by building visualizations in live JavaScript notebooks
            </a>
          </div>
          <div>
            <a class="section" href="https://observablehq.com/framework/">
              <h2>Observable Framework</h2>
              Use Observable Framework to build data apps locally. With data loaders, you can build in any language or
              library, including Python, SQL, and R
            </a>
            <a class="section" href="https://observablehq.com/plot/">
              <h2>Observable Plot</h2>
              An open-source JavaScript library, Observable Plot allows you to create expressive charts with concise
              code
            </a>
            <a class="section" href="https://d3js.org">
              <h2>D3</h2>
              With over 256M downloads, D3 is the leading way to create bespoke visualizations with JavaScript
            </a>
          </div>
        </div>
        <div class="popup-footer">
          <a href="https://observablehq.com/platform">Discover the Observable Platform &rarr;</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --made-by-background: var(--vp-c-text-1);
  --made-by-color: white;
}
.dark {
  --made-by-color: black;
}

.made-by-observable > .button {
  background-color: var(--made-by-background);
  color: var(--made-by-color);
  font-weight: 600;
  border-radius: 9999px;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  width: fit-content;
  padding: 4px 8px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-wrap: nowrap;
  overflow: hidden;
  gap: 4px;
}

.made-by-observable > .button > div:first-child {
  padding-left: 8px;
}

.made-by-observable > .button > div.button-text {
  _padding-right: 4px;
}

.made-by-observable > .button:hover ~ .popup,
.made-by-observable > .popup:hover {
  display: block;
}

.made-by-observable > .popup {
  display: none;
  padding-top: 0.5rem;
  position: absolute;
  right: 0rem;
}

.made-by-observable .popup-wrapper {
  gap: 20px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: var(--vp-shadow-3);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-elv);
}

.made-by-observable .popup-header {
  font-size: 18px;
  line-height: 27px;
  font-weight: 600;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 1rem;
}

.made-by-observable .popup-footer {
  font-size: 14px;
  line-height: 21px;
  font-weight: 600;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1rem;
}

.made-by-observable .popup-footer a:hover {
  color: var(--vp-c-brand-1);
}

.made-by-observable .popup-content {
  display: flex;
  flex-direction: row;
  gap: 40px;
  margin-bottom: 20px;
}

.made-by-observable .popup a.section {
  display: block;
  text-wrap: wrap;
  width: 260px;
  margin-top: 20px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 21px;
  color: var(--vp-c-text-2);
}

.made-by-observable .popup a.section:hover h2 {
  color: var(--vp-c-brand-1);
}

.made-by-observable .popup h2 {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--vp-c-text-1);
  font-size: 16px;
  line-height: 24px;
}

/* Mobile */
@media screen and (max-width: 640px) {
  .made-by-observable .popup-content {
    flex-direction: column;
    gap: 0px;
  }
  .made-by-observable .popup a.section {
    width: 75vw;
}
}
</style>
