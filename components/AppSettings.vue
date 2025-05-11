<script setup lang="ts">
import { useSettingsStore } from '#imports'

const settingsStore = useSettingsStore()
</script>

<template>
  <UModal :v-if="settingsStore.dialog">
    <template #content>
      <article>
        <header>
          <button
            aria-label="Close"
            rel="prev"
            @click="settingsStore.toggleDialog"
          />
          <p>
            <strong>Settings</strong>
          </p>
        </header>
        <h5>Filters</h5>
        <form>
          <fieldset role="group">
            <input
              type="text"
              name="text"
              placeholder="Text"
              aria-label="Text"
            >
            <label>
              <input
                name="terms"
                type="checkbox"
              >
            </label>
          </fieldset>
        </form>
      </article>
    </template>
  </UModal>
</template>
