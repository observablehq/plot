import {ref, watchEffect} from "vue";

export function useDark() {
  const dark = ref(false);

  if (!import.meta.env.SSR) {
    watchEffect((onInvalidate) => {
      const clicked = () => (dark.value = document.documentElement.classList.contains("dark"));
      clicked();
      addEventListener("click", clicked);
      onInvalidate(() => removeEventListener("click", clicked));
    });
  }

  return dark;
}
