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
import { useUserStore } from '@/stores/user'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Sidebar from '@/components/utils/Sidebar.vue'
import Ads from '@/components/utils/Ads.vue'
import DashboardProfile from '@/components/Dashboard/DashboardProfile.vue'

// Initialize user store
const userStore = useUserStore()
const userProfile = computed(() => userStore.profile || {})

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

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  try {
    if (!userStore.isProfileLoaded) {
      await userStore.fetchAllUserData()
    }
  } catch (err) {
    console.log(err)
  }
  console.log(userProfile)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Simplified filters without computed for testing
const filters = ref({
  from: '',
  to: '',
  type: ''
})


const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'N/A'
  }
}

const formatCurrency = (amount) => {
  if (!amount) return 'NGN0.00'
  return `NGN${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
const calculateRunningBalance = (transactions) => {
  let balance = 0
  return transactions.map(tx => {
    if (tx.mode === 'CREDIT') {
      balance += Number(tx.amount || 0)
    } else if (tx.mode === 'DEBIT') {
      balance -= Number(tx.amount || 0)
    }
    return { ...tx, balance }
  })
}

async function downloadStatement(format) {
  try {
    // Get transactions
    const { transactions } = await useTransactions({ ...filters.value, page: 1, limit: 1000 })

    if (!transactions || !transactions.length) {
      alert('No transactions found for the selected filters.')
      return
    }

    if (format === 'pdf') {
      const doc = new jsPDF()

      // ===== BANK HEADER =====
      doc.setFontSize(20)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0, 51, 102) // Dark blue color
      doc.text('BANKA', 20, 25)

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0) // Black
      doc.setFont(undefined, 'normal')
      doc.text('Customer Service: +234-800-BANKA', 20, 32)
      doc.text('Email: support@banka-lite.vercel.app | Website: banka-lite.vercel.app', 20, 37)

      // Draw line under header
      doc.setDrawColor(0, 51, 102)
      doc.setLineWidth(0.5)
      doc.line(20, 42, 190, 42)

      // ===== STATEMENT TITLE =====
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0, 51, 102)
      doc.text('STATEMENT OF ACCOUNT', 20, 55)

      // ===== CUSTOMER DETAILS =====
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(0, 0, 0)

      let yPos = 68

      // Left column - Customer Info
      doc.setFont(undefined, 'bold')
      doc.text('ACCOUNT HOLDER DETAILS:', 20, yPos)
      doc.setFont(undefined, 'normal')
      yPos += 6

      const fullName = `${userProfile.value.firstName || ''} ${userProfile.value.lastName || ''}`.trim() || 'N/A'
      doc.text(`Name: ${fullName}`, 20, yPos)
      yPos += 5
      doc.text(`Email: ${userProfile.value.email || 'N/A'}`, 20, yPos)
      yPos += 5
      doc.text(`Phone: ${userProfile.value.phone || 'N/A'}`, 20, yPos)

      // Right column - Statement Info
      doc.setFont(undefined, 'bold')
      doc.text('STATEMENT DETAILS:', 110, 68)
      doc.setFont(undefined, 'normal')

      const fromDate = filters.value.from ? formatDate(filters.value.from) : 'All Time'
      const toDate = filters.value.to ? formatDate(filters.value.to) : 'Present'

      doc.text(`Period: ${fromDate} to ${toDate}`, 110, 74)
      doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 110, 79)
      doc.text(`Total Transactions: ${transactions.length}`, 110, 84)

      yPos = 95

      // ===== SUMMARY SECTION =====
      const totalCredits = transactions
        .filter(tx => tx.mode === 'CREDIT')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

      const totalDebits = transactions
        .filter(tx => tx.mode === 'DEBIT')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

      const netAmount = totalCredits - totalDebits

      // Summary box
      doc.setFillColor(245, 245, 245)
      doc.rect(20, yPos - 3, 170, 20, 'F')

      doc.setFont(undefined, 'bold')
      doc.text('TRANSACTION SUMMARY', 25, yPos + 2)
      doc.setFont(undefined, 'normal')

      doc.text(`Total Credits: ${formatCurrency(totalCredits)}`, 25, yPos + 8)
      doc.text(`Total Debits: ${formatCurrency(totalDebits)}`, 25, yPos + 13)

      doc.setFont(undefined, 'bold')
      doc.text(`Available Balance: ${formatCurrency(netAmount)}`, 110, yPos + 8)
      doc.setFont(undefined, 'normal')

      yPos += 25

      // ===== TRANSACTION TABLE HEADER =====
      doc.setFillColor(0, 51, 102)
      doc.rect(20, yPos, 170, 8, 'F')

      doc.setTextColor(255, 255, 255) // White text
      doc.setFont(undefined, 'bold')
      doc.setFontSize(9)

      doc.text('DATE', 22, yPos + 5)
      doc.text('DESCRIPTION', 45, yPos + 5)
      doc.text('REFERENCE', 85, yPos + 5)
      doc.text('DEBIT (NGN)', 118, yPos + 5)
      doc.text('CREDIT (NGN)', 140, yPos + 5)
      doc.text('BALANCE (NGN)', 165, yPos + 5)

      yPos += 12
      doc.setTextColor(0, 0, 0) // Back to black
      doc.setFont(undefined, 'normal')
      doc.setFontSize(8)

      // ===== TRANSACTION ROWS =====
      let runningBalance = 0

      transactions.forEach((tx, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          yPos = 25

          // Repeat header on new page
          doc.setFillColor(0, 51, 102)
          doc.rect(20, yPos, 170, 8, 'F')

          doc.setTextColor(255, 255, 255)
          doc.setFont(undefined, 'bold')
          doc.setFontSize(9)

          doc.text('DATE', 22, yPos + 5)
          doc.text('DESCRIPTION', 45, yPos + 5)
          doc.text('REFERENCE', 85, yPos + 5)
          doc.text('DEBIT (NGN)', 118, yPos + 5)
          doc.text('CREDIT (NGN)', 140, yPos + 5)
          doc.text('BALANCE (NGN)', 165, yPos + 5)

          yPos += 12
          doc.setTextColor(0, 0, 0)
          doc.setFont(undefined, 'normal')
          doc.setFontSize(8)
        }

        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, yPos - 2, 170, 6, 'F')
        }

        // Calculate running balance
        const amount = Number(tx.amount || 0)
        if (tx.mode === 'CREDIT') {
          runningBalance += amount
        } else if (tx.mode === 'DEBIT') {
          runningBalance -= amount
        }

        // Format data
        const date = formatDate(tx.createdAt || tx.paidAt)
        const description = (tx.mode === 'CREDIT' ? 'Credit Transfer' : 'Debit Transfer')
        const reference = (tx.reference || '').substring(0, 15)

        // Add transaction row
        doc.text(date, 22, yPos + 2)
        doc.text(description, 45, yPos + 2)
        doc.text(reference, 85, yPos + 2)

        if (tx.mode === 'DEBIT') {
          doc.setTextColor(220, 38, 127) // Red for debits
          doc.text(formatCurrency(amount), 118, yPos + 2)
          doc.setTextColor(0, 0, 0)
        } else if (tx.mode === 'CREDIT') {
          doc.setTextColor(34, 197, 94) // Green for credits
          doc.text(formatCurrency(amount), 140, yPos + 2)
          doc.setTextColor(0, 0, 0)
        }

        doc.text(formatCurrency(Math.abs(runningBalance)), 165, yPos + 2)

        yPos += 6
      })

      // ===== FOOTER =====
      if (yPos > 250) {
        doc.addPage()
        yPos = 25
      }

      yPos += 15
      doc.setDrawColor(0, 51, 102)
      doc.line(20, yPos, 190, yPos)
      yPos += 8

      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('This statement is computer-generated and does not require a signature.', 20, yPos)
      yPos += 4
      doc.text('For inquiries, contact our customer service team.', 20, yPos)
      yPos += 4
      doc.text(`Generated on: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`, 20, yPos)

      // Save with formatted filename
      const fileName = `bank-statement-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

    } else if (format === 'csv') {
      const header = ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance', 'Status']
      let runningBalance = 0

      const rows = transactions.map(tx => {
        const amount = Number(tx.amount || 0)
        if (tx.mode === 'CREDIT') {
          runningBalance += amount
        } else if (tx.mode === 'DEBIT') {
          runningBalance -= amount
        }

        return [
          formatDate(tx.createdAt || tx.paidAt),
          tx.mode === 'CREDIT' ? 'Credit Transfer' : 'Debit Transfer',
          tx.reference || '',
          tx.mode === 'DEBIT' ? amount : '',
          tx.mode === 'CREDIT' ? amount : '',
          Math.abs(runningBalance),
          tx.status || ''
        ]
      })

      const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `bank-statement-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Error generating statement:', error)
    alert('Error generating statement. Please try again.')
  }
}
</script>
Improve
