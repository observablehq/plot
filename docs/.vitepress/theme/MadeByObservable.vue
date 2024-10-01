<template>
  <div class="made-by-observable">
    <div class="button" v-on:click="onMadeByObservableClick()">
      Made by Observable
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.41435 6.53148C4.6731 6.20803 5.14507 6.15559 5.46852 6.41435L8.125 8.53953L10.7815 6.41435C11.1049 6.15559 11.5769 6.20803 11.8356 6.53148C12.0944 6.85492 12.042 7.32689 11.7185 7.58565L8.125 10.4605L4.53148 7.58565C4.20803 7.32689 4.15559 6.85492 4.41435 6.53148Z"
          fill="currentColor"
        />
      </svg>
    </div>
    <div class="popup">
      <div>
        <div>
          <h1>Cloud platform</h1>
          <a class="section" href="/">
            <h2>observablehq.com</h2>
            The modern platform for developing and hosting powerful, performant, polyglot data apps built on open source
          </a>
          <a class="section" href="/">
            <h2>Observable Platform docs</h2>
            Get the most out of Observable's cloud platform by reading the docs
          </a>
        </div>
        <div>
          <h1>Documentation hub</h1>
          <a class="section" href="/">
            <h2>Observable Framework</h2>
            A static-site generator for data apps
          </a>
          <a class="section" href="/">
            <h2>Observable Plot</h2>
            A JavaScript library for visualizing tabular data, focused on accelerating exploratory data analysis
          </a>
          <a class="section" href="/">
            <h2>D3</h2>
            A JavaScript library for visualizing data, offering flexible, dynamic graphics with a low-level,
            web-standards based approach
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    onMadeByObservableClick(popupRef) {
      function is_touch_enabled() {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
      }
      if (!is_touch_enabled()) {
        return;
      }
      const popup = document.querySelector(".made-by-observable > .popup");
      popup.style.display = (!popup.style.display || popup.style.display === "none") ? "block" : "none";
    }
  }
};
</script>

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
  gap: 4px;
  text-wrap: nowrap;
  overflow: hidden;
  width: fit-content;
}

.made-by-observable > .button:hover ~ .popup,
.made-by-observable > .popup:hover {
  display: block;
}

.made-by-observable > .popup {
  display: none;
  _display: block;
  padding-top: 0.5rem;
  position: absolute;
  right: 0rem;
}

.made-by-observable > .popup > div {
  display: flex;
  gap: 1rem;
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #cccccc;
  font-size: normal;
}

.made-by-observable > .popup h1 {
  font-weight: 600;
  border-bottom: 1px solid #cccccc;
  margin: 0.5rem 1rem;
  padding-bottom: 0.25rem;
  color: var(--vp-c-brand-2);
}

.made-by-observable > .popup a.section {
  display: block;
  text-wrap: wrap;
  width: 300px;
  margin-top: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
}

.made-by-observable > .popup a.section:hover {
  background-color: #fafafa;
}

.made-by-observable > .popup h2 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--vp-c-brand-dark);
  font-size: large;
}

@media screen and (max-width: 768px) {
  .made-by-observable > .popup > div {
    flex-direction: column;
    padding: 1rem;
    margin: 4rem;
  }
  .made-by-observable > .popup a.section {
    width: 100%;
  }
}
</style>
