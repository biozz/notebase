<script setup lang="ts">
import { navigateTo } from "#app";
import { pb, ref, useActivitiesStore, useOverlay } from "#imports";
import { useSettingsStore } from "~/stores/settings";
import type { NavigationMenuItem } from "@nuxt/ui";
import { LazySettings } from "#components";

const activitiesStore = useActivitiesStore();

const onLogout = async () => {
  pb.authStore.clear();
  await navigateTo({ name: "login" });
};

const queries = {
  debt: "frontmatter.type = 'debt'",
  track: "frontmatter.type = 'track'",
};

const setQuery = (query: string) => {
  activitiesStore.query = query;
};

const overlay = useOverlay();

const settingsModal = overlay.create(LazySettings);

const settingsStore = useSettingsStore();

const items = ref<NavigationMenuItem[]>([
  {
    label: "Notebase",
  },
  {
    label: "Settings",
    onSelect: (e) => {
      settingsModal.open();
    },
  },
  {
    label: "Debt",
    onClick: () => setQuery(queries.debt),
  },
  {
    label: "Track",
    onClick: () => setQuery(queries.track),
  },
  {
    label: pb.authStore.isValid ? "Logout" : "Login",
    onClick: pb.authStore.isValid
      ? onLogout
      : () => navigateTo({ name: "login" }),
  },
]);
</script>

<template>
  <UNavigationMenu :items="items" class="w-full justify-center" />
</template>
