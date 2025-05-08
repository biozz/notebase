import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const dialog = ref(false);

  const toggleDialog = () => {
    dialog.value = !dialog.value;
  };

  return { dialog, toggleDialog };
});
