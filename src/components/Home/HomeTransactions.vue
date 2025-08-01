<template>
  <section class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 mt-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Latest Transactions</h2>
      <router-link to="/transactions" class="text-sm text-blue-600 hover:text-blue-700 font-medium">View
        More</router-link>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Loading...</div>

    <div v-else-if="!transactions.length" class="text-center py-8 text-gray-500">
      No transactions yet.
    </div>

    <div v-else class="space-y-3">
      <div v-for="tx in transactions.slice(0, 5)" :key="tx.id"
        class="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <div class="font-medium text-gray-900">
            {{ tx.mode === 'CREDIT' ? 'Money Received' : 'Money Sent' }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(tx.createdAt || tx.paidAt) }}
          </div>
        </div>
        <div class="text-right">
          <div :class="tx.mode === 'CREDIT' ? 'text-green-600' : 'text-red-600'">
            {{ tx.mode === 'CREDIT' ? '+' : '-' }}₦{{ formatAmount(tx.amount) }}
          </div>
          <button class="ml-4 text-xs text-blue-600 hover:underline" @click="viewDetails(tx)">View Details</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionEvents } from '@/composables/useTransactionEvents'
import { useRouter } from 'vue-router'

const transactions = ref([])
const loading = ref(true)
const router = useRouter()
const { onTransactionCompleted, offTransactionCompleted } = useTransactionEvents()

function formatDate(dateObj) {
  if (!dateObj) return ''
  let date
  if (dateObj.seconds) {
    date = new Date(dateObj.seconds * 1000)
  } else {
    date = new Date(dateObj)
  }
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatAmount(amount) {
  if (!amount && amount !== 0) return '0.00'
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function viewDetails(tx) {
  // Placeholder for modal logic
  alert('Transaction details coming soon!')
}

// Listen for transaction completion events
const handleTransactionCompleted = () => {
  // Add a small delay to ensure backend has processed the transaction
  setTimeout(() => {
    fetchTransactions()
  }, 1000)
}

const fetchTransactions = async () => {
  loading.value = true
  try {
    const { transactions: txs } = await useTransactions()
    transactions.value = txs || []
  } catch (e) {
    transactions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
  onTransactionCompleted(handleTransactionCompleted)
})

onUnmounted(() => {
  offTransactionCompleted(handleTransactionCompleted)
})
</script>