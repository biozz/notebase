import { defineNuxtPlugin } from "#app";
import { Debt } from "#components";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("debt", Debt);
});
