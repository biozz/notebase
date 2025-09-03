import PocketBase, { type ListResult } from 'pocketbase'
import type { BaseClient, Frontmatter, ItemRecord } from '../../types/types'

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

  const restartSync = async () => {
    await pb.send('/sync/restart', {})
  }

  return {
    isAuthenticated,
    clearAuth,
    authenticatedUser,
    updateFrontmatter,
    updateContent,
    getList,
    getItem,
    restartSync,
  }
}
