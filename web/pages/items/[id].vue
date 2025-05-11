<script setup lang="ts">
import { onMounted, shallowRef, ref } from 'vue'
import type { MDCParserResult } from '@nuxtjs/mdc'
import {
  definePageMeta,
  getItem,
  transformItem,
  useActivitiesStore,
  useRoute,
  type Item,
  useMarkdownParser,
} from '#imports'
import { BaseItem } from '#components'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const activitiesStore = useActivitiesStore()
const parseMd = useMarkdownParser()
const contentAst = ref<MDCParserResult | null>(null)
const frontmatterAst = ref<MDCParserResult | null>(null)
const item = shallowRef<Item>()
const error = shallowRef<string>()

const isLoading = shallowRef(false)

onMounted(async () => {
  if (typeof route.params.id !== 'string') {
    error.value = 'Invalid item id'
    return
  }
  isLoading.value = true
  let itemToFind = activitiesStore.items.find(item => item.id === route.params.id)
  if (!itemToFind) {
    try {
      const result = await getItem(route.params.id)
      itemToFind = transformItem(result)
    }
    catch (e) {
      console.error(e)
      error.value = 'Item not found'
    }
  }
  item.value = itemToFind
  isLoading.value = false

  contentAst.value = await parseMd(item.value!.content)
  frontmatterAst.value = await parseMd('```json\n' + JSON.stringify(item.value!.frontmatter, null, 2) + '\n```')
})
</script>

<template>
  <div>
    <ULink to="/">back</ULink>
    <template v-if="isLoading">
      <h1>Loading...</h1>
    </template>
    <template v-else-if="item">
      <h1 class="text-2xl font-bold mb-5">
        {{ item.title }}
      </h1>
      <BaseItem
        :item="item"
        :is-list="false"
      />
      <hr class="my-4">
      <UCollapsible>
        <UButton
          class="group"
          label="Frontmatter"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-chevron-down"
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
          block
        />

        <template #content>
          <Suspense>
            <MDCRenderer
              v-if="frontmatterAst?.body"
              :body="frontmatterAst.body"
              :data="frontmatterAst.data"
            />
          </Suspense>
        </template>
      </UCollapsible>
      <UCollapsible
        class="mt-4"
      >
        <UButton
          class="group"
          label="Content"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-chevron-down"
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
          block
        />

        <template #content>
          <Suspense>
            <MDCRenderer
              v-if="contentAst?.body"
              :body="contentAst.body"
              :data="contentAst.data"
              class="prose dark:prose-invert"
            />
          </Suspense>
        </template>
      </UCollapsible>
    </template>
    <template v-else-if="error">
      <h1>{{ error }}</h1>
    </template>
  </div>
</template>
