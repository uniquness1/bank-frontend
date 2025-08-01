<template>
  <section class="flex h-screen mb-20 md:mb-0">
    <Sidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />
    <div class="flex-1 flex flex-col min-h-0 px-4 py-10">
      <div class="flex-1 overflow-y-auto max-w-5xl w-full">
        <h1 class="text-2xl font-bold mb-6">My Savings</h1>
        <div class="mb-6 flex justify-end">
          <button class="px-4 py-2 rounded bg-black text-white cursor-pointer" @click="showCreate = true">+ New
            Savings</button>
        </div>
        <div v-if="loading" class="text-center text-gray-500">Loading...</div>
        <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
        <div v-else-if="!savings.length" class="text-center text-gray-500">No savings yet.</div>
        <div v-else class="space-y-4">
          <div v-for="s in savings" :key="s.id"
            class="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white relative">
            <div>
              <div class="font-semibold text-lg">{{ s.name }}</div>
              <div class="text-sm text-gray-600">Target: ₦{{ s.targetAmount.toLocaleString() }}</div>
              <div class="text-sm text-gray-600">Balance: ₦{{ s.balance.toLocaleString() }}</div>
              <div class="text-xs text-gray-400">Status: {{ s.status }}</div>
            </div>
            <div class="relative">
              <button @click="toggleDropdown(s.id)" class="cursor-pointer focus:outline-none" aria-label="More options">
                <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6v.01M12 12v.01M12 18v.01"></path>
                </svg>
              </button>
              <div v-if="openDropdownId === s.id"
                class="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <div class="flex flex-col gap-1 p-2">
                  <p v-if="s.status !== 'closed' && s.status !== 'completed'" class="text-black text-sm cursor-pointer"
                    @click="openDeposit(s)">
                    Deposit</p>
                  <p v-if="s.status !== 'closed' && s.status !== 'completed'" class="text-black text-sm cursor-pointer"
                    @click="openAutoCharge(s)">
                    Auto Deposit</p>
                  <p v-if="s.status !== 'closed'" class="text-black text-sm cursor-pointer" @click="openWithdraw(s)">
                    Withdraw Savings</p>
                  <p v-if="s.status !== 'closed' && s.status !== 'completed'" class="text-black text-sm cursor-pointer"
                    @click="closeSavings(s)" :disabled="closeLoading">
                    {{ closeLoading ? 'Closing...' : 'Close' }}
                  </p>

                  <p class="text-red-600 text-sm cursor-pointer" @click="openDeleteConfirm(s)">Delete</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Savings Modal -->
        <div v-if="showCreate" class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-semibold mb-4">Create New Savings</h2>
            <form @submit.prevent="handleCreate">
              <div class="mb-3">
                <label class="block text-sm mb-1">Saving's Name</label>
                <input v-model="newSavings.name" type="text" class="border rounded px-2 py-1 w-full" required />
              </div>
              <div class="mb-3">
                <label class="block text-sm mb-1">Target Amount</label>
                <input v-model.number="newSavings.targetAmount" type="number" min="1"
                  class="border rounded px-2 py-1 w-full" required />
              </div>
              <div class="flex gap-2 mt-4">
                <button type="button" class="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 w-full"
                  @click="showCreate = false" :disabled="loadingCreate">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded bg-black text-white w-full" :disabled="loadingCreate">{{
                  loadingCreate ? 'Creating...' : 'Create' }}</button>
              </div>
              <p v-if="createError" class="text-red-600 text-center mt-2">{{ createError }}</p>
            </form>
          </div>
        </div>

        <!-- Deposit Modal -->
        <div v-if="showDeposit" class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-semibold mb-4">Deposit to {{ selectedSavings?.name }}</h2>
            <form @submit.prevent="handleDeposit">
              <div class="mb-3">
                <label class="block text-sm mb-1">Amount</label>
                <input v-model.number="depositAmount" type="number" min="1" class="border rounded px-2 py-1 w-full"
                  required :disabled="depositLoading" />
              </div>
              <div class="flex gap-2 mt-4">
                <button type="button" class="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 w-full"
                  @click="showDeposit = false" :disabled="depositLoading">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded bg-black text-white w-full" :disabled="depositLoading">
                  {{ depositLoading ? 'Depositing...' : 'Deposit' }}
                </button>
              </div>
              <p v-if="depositError" class="text-red-600 text-center mt-2">{{ depositError }}</p>
            </form>
          </div>
        </div>

        <!-- Withdraw Modal -->
        <div v-if="showWithdraw" class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-semibold mb-4">Withdraw from {{ selectedSavings?.name }}</h2>
            <form @submit.prevent="handleWithdraw">
              <div class="mb-3">
                <label class="block text-sm mb-1">Amount</label>
                <input v-model.number="withdrawAmount" type="number" min="1" class="border rounded px-2 py-1 w-full"
                  required :disabled="withdrawLoading" />
              </div>
              <div class="flex gap-2 mt-4">
                <button type="button" class="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 w-full"
                  @click="showWithdraw = false" :disabled="withdrawLoading">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded bg-black text-white w-full" :disabled="withdrawLoading">
                  {{ withdrawLoading ? 'Withdrawing...' : 'Withdraw' }}
                </button>
              </div>
              <p v-if="withdrawError" class="text-red-600 text-center mt-2">{{ withdrawError }}</p>
            </form>
          </div>
        </div>

        <!-- Auto Charge Modal -->
        <div v-if="showAutoCharge" class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-semibold mb-4">Auto Charge for {{ selectedSavings?.name }}</h2>
            <form @submit.prevent="handleAutoCharge">
              <div class="mb-3">
                <label class="block text-sm mb-1">Amount per charge</label>
                <input v-model.number="autoChargeAmount" type="number" min="1" class="border rounded px-2 py-1 w-full"
                  required :disabled="autoChargeLoading" />
              </div>
              <div class="mb-3">
                <label class="block text-sm mb-1">Interval (minutes)</label>
                <input v-model.number="autoChargeInterval" type="number" min="1" class="border rounded px-2 py-1 w-full"
                  required :disabled="autoChargeLoading" />
              </div>
              <div class="flex gap-2 mt-4">
                <button type="button" class="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 w-full"
                  @click="showAutoCharge = false" :disabled="autoChargeLoading">
                  Cancel
                </button>
                <button type="submit" class="px-4 py-2 rounded bg-black text-white w-full"
                  :disabled="autoChargeLoading">
                  {{ autoChargeLoading ? 'Saving...' : 'Save Auto Charge' }}
                </button>
              </div>
              <button v-if="selectedSavings?.autoChargeEnabled" type="button"
                class="mt-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 w-full" @click="disableAutoCharge"
                :disabled="autoChargeLoading">
                {{ autoChargeLoading ? 'Disabling...' : 'Disable Auto Charge' }}
              </button>
              <p v-if="autoChargeError" class="text-red-600 text-center mt-2">{{ autoChargeError }}</p>
            </form>
          </div>
        </div>
        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-lg font-semibold mb-4">Delete Savings Goal</h2>
            <p>Are you sure you want to delete <b>{{ selectedSavings?.name }}</b>? This cannot be undone.</p>
            <div class="flex gap-2 mt-4">
              <button @click="handleDeleteSavings"
                class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 w-full" :disabled="deleteLoading">
                {{ deleteLoading ? 'Deleting...' : 'Delete' }}
              </button>
              <button @click="showDeleteConfirm = false"
                class="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 w-full" :disabled="deleteLoading">
                Cancel
              </button>
            </div>
            <p v-if="deleteError" class="text-red-600 text-center mt-2">{{ deleteError }}</p>
          </div>
        </div>
      </div>
    </div>
    <Ads />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/composables/useApi'
import Cookies from 'js-cookie'
import Sidebar from '@/components/utils/Sidebar.vue'
import Ads from '@/components/utils/Ads.vue'

const savings = ref([])
const loading = ref(false)
const error = ref('')

const showCreate = ref(false)
const newSavings = ref({ name: '', targetAmount: 0 })
const loadingCreate = ref(false)
const createError = ref('')

const showDeposit = ref(false)
const depositAmount = ref(0)
const depositError = ref('')
const depositLoading = ref(false)

const showWithdraw = ref(false)
const withdrawAmount = ref(0)
const withdrawError = ref('')
const withdrawLoading = ref(false)

const showAutoCharge = ref(false)
const autoChargeAmount = ref(0)
const autoChargeInterval = ref(1)
const autoChargeError = ref('')
const autoChargeLoading = ref(false)

const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const deleteError = ref('')

const closeLoading = ref(false)

const selectedSavings = ref(null)
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openDropdownId = ref(null)

function toggleDropdown(savingsId) {
  openDropdownId.value = openDropdownId.value === savingsId ? null : savingsId
}

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
      openDropdownId.value = null
    }
  })
})

async function fetchSavings() {
  loading.value = true
  error.value = ''
  try {
    const token = Cookies.get('authToken')
    const res = await api.get('/api/savings', { headers: { Authorization: `Bearer ${token}` } })
    savings.value = res.data.savings || []
  } catch (err) {
    error.value = 'Failed to fetch savings.'
  } finally {
    loading.value = false
  }
}
onMounted(fetchSavings)

async function handleCreate() {
  loadingCreate.value = true
  createError.value = ''
  try {
    const token = Cookies.get('authToken')
    await api.post('/api/savings', newSavings.value, { headers: { Authorization: `Bearer ${token}` } })
    showCreate.value = false
    newSavings.value = { name: '', targetAmount: 0 }
    fetchSavings()
  } catch (err) {
    createError.value = err.response?.data?.error || 'Failed to create savings.'
  } finally {
    loadingCreate.value = false
  }
}

function openDeposit(s) {
  selectedSavings.value = s
  depositAmount.value = 0
  depositError.value = ''
  depositLoading.value = false
  showDeposit.value = true
  openDropdownId.value = null
}

async function handleDeposit() {
  depositError.value = ''
  depositLoading.value = true
  try {
    const token = Cookies.get('authToken')
    await api.post(`/api/savings/${selectedSavings.value.id}/deposit`, { amount: depositAmount.value }, { headers: { Authorization: `Bearer ${token}` } })
    showDeposit.value = false
    fetchSavings()
  } catch (err) {
    depositError.value = err.response?.data?.error || 'Failed to deposit.'
  } finally {
    depositLoading.value = false
  }
}

function openWithdraw(s) {
  selectedSavings.value = s
  withdrawAmount.value = 0
  withdrawError.value = ''
  withdrawLoading.value = false
  showWithdraw.value = true
  openDropdownId.value = null
}

async function handleWithdraw() {
  withdrawError.value = ''
  withdrawLoading.value = true
  try {
    const token = Cookies.get('authToken')
    await api.post(`/api/savings/${selectedSavings.value.id}/withdraw`, { amount: withdrawAmount.value }, { headers: { Authorization: `Bearer ${token}` } })
    showWithdraw.value = false
    fetchSavings()
  } catch (err) {
    withdrawError.value = err.response?.data?.error || 'Failed to withdraw.'
  } finally {
    withdrawLoading.value = false
  }
}

async function closeSavings(s) {
  closeLoading.value = true
  try {
    const token = Cookies.get('authToken')
    await api.patch(`/api/savings/${s.id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } })
    fetchSavings()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to close savings.')
  } finally {
    closeLoading.value = false
    openDropdownId.value = null
  }
}

function openAutoCharge(s) {
  selectedSavings.value = s
  autoChargeAmount.value = s.autoChargeAmount || 0
  autoChargeInterval.value = s.autoChargeInterval || 1
  autoChargeError.value = ''
  autoChargeLoading.value = false
  showAutoCharge.value = true
  openDropdownId.value = null
}

async function handleAutoCharge() {
  autoChargeError.value = ''
  autoChargeLoading.value = true
  try {
    const token = Cookies.get('authToken')
    await api.post(
      `/api/savings/${selectedSavings.value.id}/auto-charge`,
      { amount: autoChargeAmount.value, intervalMinutes: autoChargeInterval.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    showAutoCharge.value = false
    fetchSavings()
  } catch (err) {
    autoChargeError.value = err.response?.data?.error || 'Failed to setup auto charge.'
  } finally {
    autoChargeLoading.value = false
  }
}

async function disableAutoCharge() {
  autoChargeError.value = ''
  autoChargeLoading.value = true
  try {
    const token = Cookies.get('authToken')
    await api.delete(
      `/api/savings/${selectedSavings.value.id}/auto-charge`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    showAutoCharge.value = false
    fetchSavings()
  } catch (err) {
    autoChargeError.value = err.response?.data?.error || 'Failed to disable auto charge.'
  } finally {
    autoChargeLoading.value = false
  }
}

function openDeleteConfirm(s) {
  selectedSavings.value = s
  deleteError.value = ''
  deleteLoading.value = false
  showDeleteConfirm.value = true
  openDropdownId.value = null
}

async function handleDeleteSavings() {
  deleteLoading.value = true
  deleteError.value = ''
  try {
    const token = Cookies.get('authToken')
    await api.delete(`/api/savings/${selectedSavings.value.id}`, { headers: { Authorization: `Bearer ${token}` } })
    showDeleteConfirm.value = false
    fetchSavings()
  } catch (err) {
    deleteError.value = err.response?.data?.error || 'Failed to delete savings.'
  } finally {
    deleteLoading.value = false
  }
}
</script>