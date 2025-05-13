import PocketBase from 'pocketbase'
import type { BaseClient } from '../../types/types'
import { frontmatterSchema, recordSchema } from '../../types/schema'
import { parseDate } from './time'

export function createPocketBaseClient(url: string): BaseClient {
  const pb = new PocketBase(url)

  const getItem = async (id: string) => {
    const item = await pb.collection('files').getOne(id)
    const parsed = recordSchema.parse(item)
    return parsed
  }

  const toggleItem = async (id: string) => {
    const item = await getItem(id)
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
    const res = await pb.collection('files').update(item.id, {
      frontmatter,
    })
    return recordSchema.parse(res)
  }

  const addDebtTransaction = async (id: string, amount: number, comment?: string) => {
    const item = await getItem(id)

    const frontmatter = frontmatterSchema.parse(item.frontmatter ? item.frontmatter : {})

    const transaction = {
      amount,
      created: new Date().toISOString().split('.')[0]!,
      comment,
    }
    frontmatter.transactions?.push(transaction)
    const res = await pb.collection('files').update(item.id, {
      frontmatter,
    })
    return recordSchema.parse(res)
  }
  const updateDebtTransaction = async (
    id: string,
    date: string,
    payload: { date?: string, amount?: number, comment?: string } = {},
  ) => {
    const item = await getItem(id)

    const frontmatter = frontmatterSchema.parse(item.frontmatter ? item.frontmatter : {})
    const originalDate = parseDate(date)

    const transaction = frontmatter.transactions?.find(t =>
      parseDate(t.created).compare(originalDate) === 0,
    )
    if (!transaction) {
      throw new Error('Transaction not found')
    }
    transaction.created = payload.date ?? transaction.created
    transaction.amount = payload.amount ?? transaction.amount
    transaction.comment = payload.comment ?? transaction.comment
    const res = await pb.collection('files').update(item.id, {
      frontmatter,
    })
    return recordSchema.parse(res)
  }
  const isAuthenticated = async () => {
    return pb.authStore.isValid
  }
  const clearAuth = async () => {
    pb.authStore.clear()
  }

  const authenticatedUser = async ({ email, password }: { email: string, password: string }) => {
    return await pb.collection('_superusers')
      .authWithPassword(email, password)
  }

  const getList = async (page: number, pageSize: number, filter: string) => {
    const { items, ...rest } = await pb.collection('files').getList(page, pageSize, {
      filter,
    })
    return {
      ...rest,
      items: recordSchema.array().parse(items),
    }
  }

  return {
    getItem,
    toggleItem,
    addDebtTransaction,
    updateDebtTransaction,
    isAuthenticated,
    clearAuth,
    authenticatedUser,
    getList,
  }
}
