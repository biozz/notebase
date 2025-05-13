<script lang="ts">
import { z } from 'zod'

export const formSchema = z.object({
  amount: z.number(),
  comment: z.string().min(1).max(256),
})

export type FormState = z.infer<typeof formSchema>
</script>

<script setup lang="ts" generic="T extends ItemRecord & { frontmatter: DebtFrontmatter }">
import type { TableColumn } from '@nuxt/ui'
import { h, ref, computed, useClient, useActivitiesStore } from '#imports'
import { UButton, LazyDebtAddFrom } from '#components'
import type { ItemRecord, DebtFrontmatter } from '#pocketbase-imports'

const { item, isList } = defineProps<{ item: T, isList?: boolean }>()

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

const progress = computed(() => {
  return Math.round((clamp(returned.value, 0, total.value) / total.value) * 100)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: item.frontmatter.currency,
  }).format(amount)
}

const total = computed(() => {
  return item.frontmatter.transactions.reduce((acc, tx) => {
    return acc + tx.amount
  }, 0)
})

const returned = computed(() => {
  return item.frontmatter.transactions.reduce((acc, tx) => {
    return acc + Math.abs(tx.amount)
  }, 0)
})
const left = computed(() => {
  return total.value - returned.value
})

const transactions = computed(() => {
  return item.frontmatter.transactions.map((tx) => {
    return {
      id: `${tx.created}-${tx.amount}-${tx.comment ?? 'None'}`,
      amount: tx.amount,
      comment: tx.comment,
    }
  })
})

const columns: TableColumn<{ id: string, amount: number, comment: string | null | undefined }>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      // TODO: fix sorting
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Date',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) => {
      return new Date(row.getValue('id')).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: item.frontmatter.currency,
      }).format(row.getValue('amount'))
    },
  },
  {
    accessorKey: 'comment',
    header: 'Comment',
    cell: ({ row }) => {
      return row.getValue('comment') ?? '-'
    },
  },
]

const sorting = ref([
  {
    id: 'id',
    desc: false,
  },
])

const activitiesStore = useActivitiesStore()
const pb = useClient()

async function handleSuccess(data: FormState) {
  const itemToUpdate = await pb.addDebtTransaction(item.id, data.amount, data.comment)
  activitiesStore.updateItem(itemToUpdate)
}
</script>

<template>
  <div>
    <UProgress
      v-model="progress"
      size="xl"
      status
    />
    <div v-if="!isList">
      <h5>Всего: {{ formatCurrency(total) }}</h5>
      <h5>Возвращено: {{ formatCurrency(returned) }}</h5>
      <h5>Осталось: {{ formatCurrency(left) }}</h5>
      <LazyDebtAddFrom @success="handleSuccess" />
      <UTable
        v-model:sorting="sorting"
        :data="transactions"
        :columns="columns"
      />
    </div>
  </div>
</template>
