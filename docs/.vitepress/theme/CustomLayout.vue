<script setup>

import DefaultTheme from "vitepress/theme-without-fonts";
import ObservablePromo from "./ObservablePromo.vue";

const {Layout} = DefaultTheme;

</script>

<template>
  <Layout>
    <template #home-features-after>
      <ObservablePromo />
    </template>
  </Layout>
</template>
