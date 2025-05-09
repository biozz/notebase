import { pb } from '#imports'

export function getItem(id: string) {
  return pb.collection('files').getOne(id)
}
