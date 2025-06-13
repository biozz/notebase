import PocketBase, { type ListResult } from 'pocketbase'
import type { BaseClient, Frontmatter, ItemRecord, ActivityFilter } from '../../types/types'
import type { ActivityFilterFilters } from '../../types/schema'

export function createPocketBaseClient(url: string): BaseClient {
  const pb = new PocketBase(url)

  const getList = async (page: number, pageSize: number, filter: string): Promise<ListResult<ItemRecord>> => {
    return await pb.collection('files').getList(page, pageSize, { filter })
  }

  const getItem = async (id: string): Promise<ItemRecord> => {
    return await pb.collection('files').getOne(id)
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

  const updateFrontmatter = async (id: string, data: Frontmatter) => {
    await pb.collection('files').update(id, { frontmatter: data })
  }

  const updateContent = async (id: string, data: string) => {
    await pb.collection('files').update(id, { content: data })
  }

  const getFilters = async (): Promise<ActivityFilter[]> => {
    return await pb.collection('filters').getFullList()
  }

  const updateFilter = async (id: string, data: Partial<ActivityFilter>): Promise<ActivityFilter> => {
    return await pb.collection('filters').update(id, data)
  }

  const createFilter = async (label: string, filters?: Partial<ActivityFilterFilters>[]): Promise<ActivityFilter> => {
    return await pb.collection('filters').create({ label: label, filters: filters })
  }
  const deleteFilter = async (id: string): Promise<void> => {
    await pb.collection('filters').delete(id)
  }

  return {
    isAuthenticated,
    clearAuth,
    authenticatedUser,
    updateFrontmatter,
    updateContent,
    getList,
    getItem,
    getFilters,
    updateFilter,
    createFilter,
    deleteFilter,
  }
}
