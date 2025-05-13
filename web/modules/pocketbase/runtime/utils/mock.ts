import { useLocalStorage } from '@vueuse/core'
import type { RecordModel } from 'pocketbase'
import type { BaseClient, DebtTransaction } from '../../types/types'
import { frontmatterSchema, type ItemRecord } from '../../types/schema'
import tasks from '~/assets/mock/tasks.json'
import debts from '~/assets/mock/debts.json'
import tracks from '~/assets/mock/tracks.json'
import withContent from '~/assets/mock/withContent.json'
import { parseDate } from './time'

const createDefaultReturn = () => {
  const defaultReturn: RecordModel = {
    id: crypto.randomUUID().toString(),
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
        hash: crypto.randomUUID().toString(),
        path: '',
        slug: '',
        updated: new Date().toISOString(),
      }
      return _item
    })
    localItems.value = items
  }

  return {
    getItem: async (id: string) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      return item
    },
    toggleItem: async (id: string) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      let frontmatter = item.frontmatter
      if (frontmatter && 'completed' in frontmatter && frontmatter.completed) {
        frontmatter.completed = ''
      }
      else {
        frontmatter = {
          ...frontmatter,
          completed: new Date().toISOString(),
        }
      }
      return item
    },
    addDebtTransaction: async (id: string, amount: number, comment?: string) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      const frontmatter = item.frontmatter
      if (frontmatter && 'transactions' in frontmatter && frontmatter.transactions && Array.isArray(frontmatter.transactions)) {
        frontmatter.transactions.push({
          amount,
          comment,
          created: new Date().toISOString(),
        })
      }
      return item
    },
    updateDebtTransaction: async (
      id: string,
      date: string,
      payload: { date?: string, amount?: number, comment?: string } = {},
    ) => {
      const item = localItems.value.find(item => item.id === id)
      if (!item) {
        throw new Error('Item not found')
      }
      const transaction = (item.frontmatter.transactions as DebtTransaction[])?.find(
        t => parseDate(t.created).compare(parseDate(date)) === 0,
      )
      if (!transaction) {
        throw new Error('Transaction not found')
      }
      transaction.created = payload.date ?? transaction.created
      transaction.amount = payload.amount ?? transaction.amount
      transaction.comment = payload.comment ?? transaction.comment

      return item
    },
    getList: async (page: number, pageSize: number, _filter: string) => {
      const filteredItems = localItems.value.filter(() => true)
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedItems = filteredItems.slice(start, end)
      return {
        items: paginatedItems,
        totalItems: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / pageSize),
        perPage: pageSize,
        page,
      }
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
