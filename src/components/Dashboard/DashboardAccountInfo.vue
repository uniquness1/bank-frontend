<template>
  <section class="border border-[#dcdcdc] rounded-md p-4">
    <div class="flex items-center justify-between mb-2">
      <p class="text-xs font-light border p-1 rounded-md border-[#dcdcdc]">Banka</p>
      <div class="border py-1 px-2 rounded-md border-[#dcdcdc]">
        <span v-if="!isLoading && account?.accountNumber" class="flex items-center gap-2 text-[#121212] font-light">
          {{ account.accountNumber }}
          <i class="far fa-copy cursor-pointer" @click="copyAccountNumber"
            :title="copySuccess ? 'Copied!' : 'Copy account number'"></i>
        </span>
        <span v-else-if="!isLoading && account && !account.accountNumber">Generating...</span>
        <span v-else>Loading...</span>
      </div>
    </div>
    <div>
      <p class="text-[#121212] text-xl font-normal flex items-center gap-2">
        <span>
          <span class="text-sm font-light">₦</span>
          <span v-if="showBalance">
            {{ account?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00' }}
          </span>
          <span v-else class="tracking-wider">•••••</span>
        </span>
        <i :class="showBalance ? 'far fa-eye-slash' : 'far fa-eye'" class="text-sm font-light cursor-pointer"
          @click="toggleBalanceVisibility" :title="showBalance ? 'Hide balance' : 'Show balance'"></i>
      </p>
    </div>

    <!-- Free Transactions Left -->
    <!-- <div v-if="freeTransactionsLeft !== null && account?.accountNumber" class="mt-2 p-2 bg-blue-50 rounded-md">
      <p class="text-sm text-blue-700 font-medium">
        <i class="fas fa-gift mr-1"></i>
        Free transfers left today: {{ freeTransactionsLeft }}
      </p>
    </div> -->

    <div v-if="copySuccess"
      class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300">
      Account number copied!
    </div>

    <DashboardQuickActions class="mt-2" @transaction-completed="handleTransactionCompleted" />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/composables/useApi'
import DashboardQuickActions from './DashboardQuickActions.vue'

const userStore = useUserStore()
const showBalance = ref(false)
const copySuccess = ref(false)
const UPDATE_INTERVAL = 300000

// Use computed properties to get data from store
const userDetails = computed(() => userStore.profile)
const account = computed(() => userStore.account)
const freeTransactionsLeft = computed(() => userStore.freeTransactionsLeft)
const isLoading = computed(() => userStore.isLoading)

const toggleBalanceVisibility = () => {
  showBalance.value = !showBalance.value
}

const generateAccountNumber = async () => {
  try {
    const response = await api.post('/auth/generate-account-number')
    // Update the account in store
    if (userStore.account) {
      userStore.account.accountNumber = response.data.accountNumber
    }
  } catch (err) {
    console.error('Error generating account number:', err)
  }
}

const copyAccountNumber = async () => {
  if (!account.value?.accountNumber) return

  try {
    await navigator.clipboard.writeText(account.value.accountNumber)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = account.value.accountNumber
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

const handleTransactionCompleted = async () => {
  try {
    await userStore.fetchAccount(true) // Force refresh
  } catch (err) {
    console.error('Error updating account info after transaction:', err)
  }
}

let balanceUpdateInterval = null

onMounted(async () => {
  try {
    // If data is not loaded, fetch it
    if (!userStore.isProfileLoaded) {
      await userStore.fetchAllUserData()
    }

    // Generate account number if needed
    if (account.value && !account.value.accountNumber) {
      await generateAccountNumber()
    }

    // Set up interval to refresh account balance
    balanceUpdateInterval = setInterval(async () => {
      try {
        await userStore.fetchAccount(true) // Force refresh
      } catch (err) {
        console.error('Error during periodic balance update:', err)
      }
    }, UPDATE_INTERVAL)

    // Set up interval to refresh free transactions
    setInterval(async () => {
      await userStore.fetchFreeTransactionsLeft()
    }, 5 * 60 * 1000) // Every 5 minutes
  } catch (err) {
    console.error('Error loading account info:', err)
  }
})

onUnmounted(() => {
  if (balanceUpdateInterval) {
    clearInterval(balanceUpdateInterval)
  }
})
</script>