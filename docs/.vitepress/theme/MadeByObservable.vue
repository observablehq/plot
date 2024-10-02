<script setup>
const buttonContent = `Made by Observable
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M4.41435 6.53148C4.6731 6.20803 5.14507 6.15559 5.46852 6.41435L8.125 8.53953L10.7815 6.41435C11.1049 6.15559 11.5769 6.20803 11.8356 6.53148C12.0944 6.85492 12.042 7.32689 11.7185 7.58565L8.125 10.4605L4.53148 7.58565C4.20803 7.32689 4.15559 6.85492 4.41435 6.53148Z"
    fill="currentColor"
  />
</svg>`;
const closeContent = `<svg
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

function onClick() {
  if (!is_touch_enabled()) {
    return;
  }
  console.log("here");
  const popup = document.querySelector(".made-by-observable > .popup");
  const button = document.querySelector(".made-by-observable > .button");
  if (!popup.style.display || popup.style.display === "none") {
    popup.style.display = "block";
    button.innerHTML = closeContent;
    button.style.padding = "unset";
    button.style.width = "2rem";
  } else {
    popup.style.display = "none";
    button.innerHTML = buttonContent;
    button.style.width = "fit-content";
    button.style.padding = "0.5rem 1rem";
  }
}
</script>

<template>
  <div class="made-by-observable">
    <div class="button" @click="onClick()" v-html="buttonContent"></div>
    <div class="popup">
      <div class="popup-wrapper">
        <div class="popup-header">Observable platform</div>
        <div class="popup-content">
          <div>
            <a class="section" href="https://observablehq.com/documentation/data-apps/">
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
          <a href="https://observablehq.com/platform">Discover the Observable Platform</a> </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --made-by-background: black;
  --made-by-color: white;
}
.dark {
  --made-by-background: white;
  --made-by-color: black;
}

.made-by-observable > .button {
  background-color: var(--made-by-background);
  color: var(--made-by-color);
  padding: 4px 16px;
  font-weight: 600;
  border-radius: 9999px;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-wrap: nowrap;
  overflow: hidden;
  width: fit-content;
  height: 32px;
}

.made-by-observable > .button:hover ~ .popup,
.made-by-observable > .popup:hover {
  display: block;
}

.made-by-observable > .popup {
  _display: none;
  display: block;
  padding-top: 0.5rem;
  position: absolute;
  right: 0rem;
}

.made-by-observable .popup-wrapper {
  gap: 20px;
  background-color: var(--vp-c-bg);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #cccccc;
  font-size: normal;
  color: var(--vp-c-text-1);
}

.made-by-observable .popup-header {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  border-bottom: 1px solid #e2e2e3;
  padding-bottom: 1rem;
}

.made-by-observable .popup-footer {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  border-top: 1px solid #e2e2e3;
  padding-top: 1rem;
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
  _padding: 1rem;
  border-radius: 8px;
  font-size: 14px;
  line-height: 21px;
  color: var(--vp-c-text-2);
}

.made-by-observable .popup a:hover {
  text-decoration: underline;
}

.made-by-observable .popup a.section:hover h2 { 
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.made-by-observable .popup a.section:hover { 
  color: var(--vp-c-brand-2);
  text-decoration: none;
}

.made-by-observable .popup h2 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--vp-c-text-1);
  font-size: 15px;
  line-height: 24px;
}

@media screen and (max-width: 768px) {
  .made-by-observable > .popup > div {
    _flex-direction: column;
    padding: 1rem;
    margin: 4rem;
  }
  .made-by-observable > .popup a.section {
    width: 100%;
  }
}
</style>
