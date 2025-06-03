import { useLocalStorage } from '@vueuse/core'
import type { ListResult, RecordModel } from 'pocketbase'
import type { BaseClient, Frontmatter } from '../../types/types'
import { frontmatterSchema, type ItemRecord } from '../../types/schema'
import tasks from '~/assets/mock/tasks.json'
import debts from '~/assets/mock/debts.json'
import tracks from '~/assets/mock/tracks.json'
import withContent from '~/assets/mock/withContent.json'
import PocketBase from 'pocketbase'
import { nanoid } from 'nanoid'

const createDefaultReturn = () => {
  const defaultReturn: RecordModel = {
    id: nanoid(),
    collectionId: 'pbc_boba',
    collectionName: 'files',
    path: '',
    slug: '',
    updated: '',
    content: '\n',
  }
  return defaultReturn
}

const useLocalItems = () => useLocalStorage<ItemRecord[]>('items', [])

export function useMockClient(): BaseClient {
  const localItems = useLocalItems()
  if (localItems.value.length === 0) {
    const items = [...tasks, ...debts, ...tracks, ...withContent].map((item) => {
      const defaults = createDefaultReturn()
      const { content, ...rest } = item

      const _item: ItemRecord = {
        id: defaults.id,
        content: content ?? '',
        frontmatter: frontmatterSchema.parse(rest),
        created: new Date().toISOString(),
        path: '',
        slug: '',
        updated: new Date().toISOString(),
      }
      return _item
    })
    localItems.value = items
  }

  const _pb = new PocketBase('')
  return {
    getItem: async (id: string) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      return item
    },
    getList: async (_page: number, _pageSize: number, _filter: string): Promise<ListResult<ItemRecord>> => {
      return {
        items: localItems.value,
        page: 1,
        perPage: 10,
        totalItems: localItems.value.length,
        totalPages: 1,
      }
    },
    updateFrontmatter: async (id: string, frontmatter: Frontmatter) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      item.frontmatter = frontmatter
    },
    updateContent: async (id: string, content: string) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      item.content = content
    },
    isAuthenticated: async () => true,
    clearAuth: async () => {},
    authenticatedUser: async (_payload: { email: string, password: string }) => {
      return {
        record: {
          collectionId: '1',
          collectionName: 'items',
          id: '1',
          title: 'Mock Item',
          content: 'Mock Content',
        },
        token: '123',
        meta: {},
      }
    },
  }
}
