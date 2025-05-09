<script setup lang="ts" generic="T extends Item & { frontmatter: DebtFrontmatter }">
import type { TableColumn } from '@nuxt/ui'
import { type Item, type DebtFrontmatter, h, ref, computed, reactive } from '#imports'
import { UButton } from '#components'

const { item, isList } = defineProps<{ item: T, isList?: boolean }>()

type Transaction = {
  id: string
  amount: number
  comment?: string
}

const total = ref(0)
const returned = ref(0)
const left = computed(() => {
  return total.value - returned.value
})
const progress = computed(() => {
  return Math.round((returned.value / total.value) * 100)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: item.frontmatter.currency,
  }).format(amount)
}

const transactions = ref<Transaction[]>(item.frontmatter.transactions.map((tx) => {
  if (tx.amount > 0) {
    total.value += tx.amount
  }
  else {
    returned.value += Math.abs(tx.amount)
  }
  return {
    id: tx.created,
    amount: tx.amount,
    comment: tx.comment,
  }
}))

const columns: TableColumn<Transaction>[] = [
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
      return row.getValue('comment') || '-'
    },
  },
]

const sorting = ref([
  {
    id: 'id',
    desc: false,
  },
])

const state = reactive({
  amount: undefined,
  comment: undefined,
})
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
      <UForm
        :state="state"
        class="mt-2 flex gap-2"
      >
        <UFormField
          name="amount"
        >
          <UInput
            v-model="state.amount"
            placeholder="-20000"
            type="number"
          />
        </UFormField>

        <UFormField
          name="comment"
        >
          <UInput
            v-model="state.comment"
            placeholder="Comment"
            type="text"
          />
        </UFormField>

        <UButton type="submit">
          Add
        </UButton>
      </UForm>
      <UTable
        v-model:sorting="sorting"
        :data="transactions"
        :columns="columns"
      />
    </div>
  </div>
</template>
