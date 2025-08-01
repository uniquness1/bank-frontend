<template>
  <section class="flex h-screen border-none">
    <Sidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />
    <div class="flex-1 overflow-y-auto max-w-5xl w-full">
      <DashboardProfile class="py-4 mx-4" />
      <div class="flex-1 overflow-y-auto px-4 py-6">
        <h1 class="text-2xl font-bold mb-6">All Transactions</h1>
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 px-3 py-6 mb-6">
          <div class="flex flex-wrap md:flex-nowrap md:flex-row w-full justify-between md:gap-3 md:items-center gap-2">
            <div class="max-w-[48%] md:max-w-[25%] w-full">
              <label class="block text-sm font-medium mb-1">From</label>
              <input type="date" v-model="filters.from"
                class="border outline-none focus:outline-none rounded px-2 py-2 w-full" />
            </div>
            <div class="max-w-[48%] md:max-w-[25%] w-full">
              <label class="block text-sm font-medium mb-1">To</label>
              <input type="date" v-model="filters.to"
                class="border outline-none focus:outline-none rounded px-2 py-2 w-full" />
            </div>
            <div class="max-w-[48%] md:max-w-[25%] w-full">
              <label class="block text-sm font-medium mb-1">Type</label>
              <select v-model="filters.type" class="border rounded px-2 py-2 w-full outline-none focus:outline-none">
                <option value="">All</option>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>
            <div class="max-w-[48%] md:max-w-[30%] w-full mt-6">
              <button class="px-4 py-2 rounded bg-black text-white text-xs md:text-base text-nowrap "
                @click="downloadStatement('pdf')">Download Statement</button>
            </div>
          </div>
        </div>
        <DashboardTransactions :filters="filters" />
      </div>
    </div>
    <Ads />
  </section>
</template>

<script setup>
import DashboardTransactions from '@/components/Dashboard/DashboardTransactions.vue'
import jsPDF from 'jspdf'
import { useTransactions } from '@/composables/useTransactions'
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/utils/Sidebar.vue'
import Ads from '@/components/utils/Ads.vue'
import DashboardProfile from '@/components/Dashboard/DashboardProfile.vue'


const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
const filters = ref({
  from: '',
  to: '',
  type: ''
})

async function downloadStatement(format) {
  const { transactions } = await useTransactions({ ...filters.value, page: 1, limit: 1000 })
  if (!transactions || !transactions.length) {
    alert('No transactions found for the selected filters.')
    return
  }
  if (format === 'pdf') {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Account Statement', 20, 20)
    doc.setFontSize(10)
    let y = 35
    doc.text('Date', 20, y)
    doc.text('Type', 55, y)
    doc.text('Amount', 80, y)
    doc.text('Status', 110, y)
    doc.text('Reference', 140, y)
    y += 7
    transactions.forEach(tx => {
      doc.text((tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''), 20, y)
      doc.text(tx.mode || '', 55, y)
      doc.text(`₦${Number(tx.amount).toLocaleString()}`, 80, y)
      doc.text(tx.status || '', 110, y)
      doc.text(tx.reference || '', 140, y)
      y += 7
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })
    doc.save('account-statement.pdf')
  } else if (format === 'csv') {
    const header = ['Date', 'Type', 'Amount', 'Status', 'Reference']
    const rows = transactions.map(tx => [
      tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '',
      tx.mode || '',
      tx.amount || '',
      tx.status || '',
      tx.reference || ''
    ])
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'account-statement.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>