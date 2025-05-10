import { usePocketBase } from '~/utils/pb'

// TODO: should be in store???

export function getItem(id: string) {
  const pb = usePocketBase()
  return pb.collection('files').getOne(id)
}

export const toggleItem = async (id: string) => {
  const pb = usePocketBase()
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

export const addDebtTransaction = async (id: string, amount: number, comment: string) => {
  const pb = usePocketBase()
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
