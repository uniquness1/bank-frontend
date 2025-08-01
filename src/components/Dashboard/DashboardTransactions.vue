<template>
  <section class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 mb-20">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-base sm:text-xl font-semibold text-gray-900">Recent Transactions</h2>
      <router-link v-if="limit" to="/transactions" class="text-sm text-blue-600 hover:text-blue-700 font-medium">View
        More</router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-2">Loading transactions...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!transactionList || transactionList.length === 0" class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
          </path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ Object.keys(props.filters).length > 0 ? 'No transactions found' : 'No transactions yet' }}
      </h3>
      <p class="text-gray-500">
        {{ Object.keys(props.filters).length > 0
          ? 'No transactions match your current filters.'
          : 'Your transaction history will appear here once you start making transactions.' }}
      </p>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-3">
      <div v-for="tx in limitedTransactions" :key="tx.id"
        class="group border border-gray-200 rounded-lg p-2 md:p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div :class="[
              'w-5 h-5 md:w-10 md:h-10 rounded-full flex items-center justify-center',
              tx.mode === 'CREDIT'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            ]">
              <svg v-if="tx.mode === 'CREDIT'" class="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </div>
            <div>
              <h4 class="text-xs sm:text-base md:text-xl font-normal md:font-medium text-gray-900">
                {{ tx.mode === 'CREDIT' ? 'Money Received' : 'Money Sent' }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ tx.mode === 'CREDIT' ? 'From:' : 'To:' }}
                <span class="text-xs sm:text-sm font-medium" v-if="tx.mode === 'CREDIT'">{{
                  tx.senderName || 'Unknown' }}</span>
                <span v-if="tx.mode === 'DEBIT'" class="text-sm sm:text-sm font-medium">{{ tx.receiverName
                  || 'Unknown' }}</span>
              </p>
            </div>
          </div>
          <div class="text-right">
            <p :class="[
              'text-xs sm:text-base md:text-lg font-semibold',
              tx.mode === 'CREDIT' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ tx.mode === 'CREDIT' ? '+' : '-' }}₦{{ formatAmount(tx.amount) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatDate(tx.createdAt || tx.paidAt) }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2 opacity-100 mt-2">
          <button class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            @click="openModal(tx)">
            View Details
          </button>
          <button v-if="tx.mode === 'DEBIT'"
            class="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
            @click="generatePDFForTx(tx)">
            Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1 && !limit" class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex flex-col-reverse md:flex-row gap-4 md:gap-0 items-center justify-between text-sm text-gray-600">
        <p>
          Showing {{ ((pagination.currentPage - 1) * (pagination.limit || 20)) + 1 }} to
          {{ Math.min(pagination.currentPage * (pagination.limit || 20), pagination.totalTransactions) }}
          of {{ pagination.totalTransactions }} transactions
        </p>

        <div class="flex items-center space-x-2">
          <button class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            :disabled="!pagination.hasPrev" @click="goToPage(pagination.currentPage - 1)">
            Previous
          </button>
          <span class="px-3 py-1">
            Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
          </span>
          <button class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            :disabled="!pagination.hasNext" @click="goToPage(pagination.currentPage + 1)">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <transition name="modal-fade">
      <div v-if="showModal"
        class="modal-overlay fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
        @click.self="closeModal">
        <div class="modal bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
          <h3 class="text-xl font-semibold mb-4 text-center">Transaction Details</h3>
          <div v-if="selectedTransaction">
            <div class="mb-2"><strong>Type:</strong> {{ selectedTransaction.mode }}</div>
            <div class="mb-2"><strong>Amount:</strong> ₦{{ formatAmount(selectedTransaction.amount) }}</div>
            <div class="mb-2"><strong>Date:</strong> {{ formatDate(selectedTransaction.createdAt ||
              selectedTransaction.paidAt) }}</div>
            <div class="mb-2"><strong>Status:</strong> {{ getStatusText(selectedTransaction.status) }}</div>
            <div class="mb-2"><strong>Reference:</strong> {{ selectedTransaction.reference }}</div>
            <div class="mb-2"><strong>Description:</strong> {{ selectedTransaction.description || '-' }}</div>
            <div class="mb-2"><strong>From:</strong> {{ selectedTransaction.senderName || '-' }}</div>
            <div class="mb-2"><strong>To:</strong> {{ selectedTransaction.receiverName || '-' }}</div>
          </div>
          <div class="flex justify-end mt-6 gap-2">
            <button class="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300"
              @click="closeModal">Close</button>
            <button class="px-4 py-2 rounded bg-black text-white" @click="generatePDF">Download</button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { onMounted, ref, computed, watch, onUnmounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionEvents } from '@/composables/useTransactionEvents'
import { useRouter } from 'vue-router'
import jsPDF from 'jspdf'

const props = defineProps({
  limit: {
    type: Number,
    default: null
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})
const transactionList = ref([])
const pagination = ref(null)
const loading = ref(false)

const router = useRouter()
const showModal = ref(false)
const selectedTransaction = ref(null)
const { onTransactionCompleted, offTransactionCompleted } = useTransactionEvents()

function openModal(tx) {
  selectedTransaction.value = tx
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedTransaction.value = null
}

function generatePDFForTx(tx) {
  selectedTransaction.value = tx
  generatePDF()
}

function formatDate(dateObj) {
  if (!dateObj) return ''
  let date
  if (dateObj.seconds) {
    date = new Date(dateObj.seconds * 1000)
  } else {
    date = new Date(dateObj)
  }
  const now = new Date()
  const today = new Date(now.toLocaleDateString("en-US", { timeZone: "Africa/Lagos" }))
  const transactionDate = new Date(date.toLocaleDateString("en-US", { timeZone: "Africa/Lagos" }))
  const diffTime = today.getTime() - transactionDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  const formatOptions = { timeZone: 'Africa/Lagos' }

  if (diffDays === 0) {
    return 'Today at ' + date.toLocaleTimeString([], {
      ...formatOptions,
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays === 1) {
    return 'Yesterday at ' + date.toLocaleTimeString([], {
      ...formatOptions,
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays < 7 && diffDays > 0) {
    return date.toLocaleDateString([], {
      ...formatOptions,
      weekday: 'short'
    }) + ' at ' + date.toLocaleTimeString([], {
      ...formatOptions,
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return date.toLocaleDateString([], {
      ...formatOptions,
      month: 'short',
      day: 'numeric'
    }) + ' at ' + date.toLocaleTimeString([], {
      ...formatOptions,
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function formatAmount(amount) {
  if (!amount && amount !== 0) return '0.00'
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function getStatusText(status) {
  const statusTexts = {
    'SUCCESS': 'Completed',
    'COMPLETED': 'Completed',
    'PENDING': 'Pending',
    'PROCESSING': 'Processing',
    'FAILED': 'Failed',
    'CANCELLED': 'Cancelled'
  }
  return statusTexts[status] || status || 'Unknown'
}

function generatePDF() {
  if (!selectedTransaction.value) return
  const tx = selectedTransaction.value
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Transaction Receipt', 20, 20)
  doc.setFontSize(12)
  let y = 40
  const details = [
    ['Type', tx.mode],
    ['Amount', `₦${formatAmount(tx.amount)}`],
    ['Date', formatDate(tx.createdAt || tx.paidAt)],
    ['Status', getStatusText(tx.status)],
    ['Reference', tx.reference || '-'],
    ['Description', tx.description || '-'],
    ['From', tx.senderName || '-'],
    ['To', tx.receiverName || '-'],
  ]
  details.forEach(([label, value]) => {
    doc.text(`${label}:`, 20, y)
    doc.text(String(value), 70, y)
    y += 10
  })
  doc.save(`transaction-receipt-${tx.reference || 'receipt'}.pdf`)
}

function goToPage(page) {
  const newFilters = { ...props.filters, page }
  fetchTransactions(newFilters)
}

const fetchTransactions = async (customFilters = null) => {
  try {
    loading.value = true
    const filtersToUse = customFilters || props.filters
    const response = await useTransactions(filtersToUse)
    if (response && response.transactions) {
      transactionList.value = response.transactions
      pagination.value = response.pagination
    } else {
      transactionList.value = []
      pagination.value = null
    }

  } catch (err) {
    console.error('Error fetching transactions:', err)
    transactionList.value = []
    pagination.value = null
  } finally {
    loading.value = false
  }
}

const limitedTransactions = computed(() => {
  if (props.limit && Array.isArray(transactionList.value)) {
    return transactionList.value.slice(0, props.limit)
  }
  return transactionList.value || []
})

// Listen for transaction completion events
const handleTransactionCompleted = () => {
  // Add a small delay to ensure backend has processed the transaction
  setTimeout(() => {
    fetchTransactions()
  }, 1000)
}

onMounted(() => {
  fetchTransactions()
  onTransactionCompleted(handleTransactionCompleted)
})

onUnmounted(() => {
  offTransactionCompleted(handleTransactionCompleted)
})

watch(() => props.filters, fetchTransactions, { deep: true })
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>