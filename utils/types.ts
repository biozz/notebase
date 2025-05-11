export type Item = {
  id: string
  title: string
  content: string
  done: boolean
  type: ItemType
  frontmatter: Frontmatter
}

export type Frontmatter =
  | DebtFrontmatter
  | TrackFrontmatter

export enum ItemType {
  Track = 'track',
  Debt = 'debt',
  Task = 'task',
}

export type DebtTransaction = {
  amount: number
  created: string
  comment: string
}

export type DebtFrontmatter = {
  currency: string
  transactions: DebtTransaction[]
}

export type TrackFrontmatter = {
  season: number
  episode: number
  url: string
  next_episode: string
}
