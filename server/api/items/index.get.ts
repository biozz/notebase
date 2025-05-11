import { eventHandler, useDrizzle, tables } from '#imports'

export default eventHandler(async () => {
  const todos = await useDrizzle().select().from(tables.files).all()

  return todos
})
