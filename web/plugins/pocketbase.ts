import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import PocketBase from 'pocketbase'

function createPocketbase(url: string, _options: Record<string, any> = {}) {
  const pb = new PocketBase(url)

  const getItem = (id: string) => {
    return pb.collection('files').getOne(id)
  }
  const toggleItem = async (id: string) => {
    const item = await getItem(id)
    if (item.frontmatter.completed) {
      item.frontmatter.completed = ''
    }
    else {
      item.frontmatter.completed = (new Date()).toISOString()
    }
    const record = await pb.collection('files').update(item.id, {
      frontmatter: item.frontmatter,
    })
    console.log(record)
  }

  const addDebtTransaction = async (id: string, amount: number, comment: string) => {
    const item = await getItem(id)
    const transaction = {
      amount: amount,
      date: (new Date()).toISOString(),
      comment: comment,
    }
    item.frontmatter.transactions.push(transaction)
    const record = await pb.collection('files').update(item.id, {
      frontmatter: item.frontmatter,
    })
    console.log(record)
  }

  return {
    client: pb,
    getItem,
    toggleItem,
    addDebtTransaction,
  }
}

export default defineNuxtPlugin((_nuxtApp) => {
  const client = createPocketbase(useRuntimeConfig().public.apiBase)

  return {
    provide: {
      pb: client,
    }
  }
})
