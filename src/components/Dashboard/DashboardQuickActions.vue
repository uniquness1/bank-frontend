<template>
  <section class="rounded-lg flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <button
        class="max-w-[200px] w-full py-2 px-3 sm:px-4 rounded-md bg-black text-white border border-gray-300 text-center cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2 justify-center"
        @click="showTransfer = true"> <i
          class="fas fa-arrow-up bg-white rounded-full px-1.5 py-1 text-xs text-[#121212]"></i>
        <span>Transfer</span></button>
      <button
        class="max-w-[200px] w-full py-2 px-3 sm:px-4 rounded-md bg-black text-white border border-gray-300 text-center cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2 justify-center"
        @click="showDeposit = true">
        <i class="fas fa-plus bg-white rounded-full p-1 text-xs text-[#121212]"></i>
        <span>Deposit</span></button>
    </div>

    <!-- Transfer Modal -->
    <transition name="modal-fade">
      <div v-if="showTransfer"
        class="modal-overlay fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-end z-50"
        @click.self="closeTransferModal">
        <div class="modal bg-white p-6 max-w-[500px] w-full h-full shadow-2xl transform-gpu overflow-y-auto">
          <h3 class="text-xl font-semibold mb-4 text-center">Transfer Funds</h3>

          <!-- Bank Selection Step -->
          <div v-if="!selectedBank" class="bank-selection">
            <p class="text-gray-600 mb-4 text-center">Select a bank to transfer to:</p>

            <!-- My Bank Section -->
            <div class="mb-6">
              <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">My Bank</h4>
              <div v-for="bank in myBanks" :key="bank.bankCode"
                class="bank-option p-4 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-blue-50 transition-all duration-200"
                @click="selectBank(bank)">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <i class="fas fa-university text-white text-sm"></i>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ bank.bankName }}</p>
                      <p class="text-sm text-gray-500">Same bank transfer</p>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            </div>

            <!-- Other Banks Section -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Other Banks</h4>
              <div class="max-h-96 overflow-y-auto">
                <div v-for="bank in otherBanks" :key="bank.bankCode"
                  class="bank-option p-4 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-blue-50 transition-all duration-200"
                  @click="selectBank(bank)">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-university text-white text-sm"></i>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ bank.bankName }}</p>
                        <p class="text-sm text-gray-500">{{ bank.bankType }}</p>
                      </div>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cancel Button -->
            <button type="button"
              class="w-full mt-6 py-3 rounded-md bg-gray-200 text-black font-semibold text-base cursor-pointer hover:bg-gray-300 transition-colors"
              @click="closeTransferModal">Cancel</button>
          </div>

          <!-- Transfer Form Step -->
          <div v-else class="transfer-form">
            <!-- Selected Bank Header -->
            <div class="selected-bank-header mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-university text-white text-xs"></i>
                  </div>
                  <div>
                    <p class="font-medium text-sm">{{ selectedBankName }}</p>
                    <p class="text-xs text-gray-500">{{ isMyBank ? 'Same bank' : 'External transfer' }}</p>
                  </div>
                </div>
                <button @click="goBackToBankSelection" class="text-blue-600 hover:text-blue-800 transition-colors">
                  <i class="fas fa-edit text-sm cursor-pointer"></i>
                </button>
              </div>
            </div>

            <form @submit.prevent="showPinConfirmation">
              <!-- Account Number Input -->
              <div class="relative w-full mb-2">
                <input v-model="transferAccount" type="text" maxlength="10" placeholder="Recipient Account Number"
                  class="w-full p-3 pr-10 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @input="onAccountInput" />
                <div v-if="recipientLoading" class="absolute inset-y-0 right-3 flex items-center">
                  <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
              </div>
              <div v-if="recipientName" class="mb-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p class="text-green-800 font-medium">{{ recipientName }}</p>
              </div>
              <div v-if="recipientError" class="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p class="text-red-600">{{ recipientError }}</p>
              </div>

              <!-- Transfer Amount and Description (only show after successful validation) -->
              <template v-if="isAccountValidated">
                <input v-model.number="transferAmount" type="number" min="100" placeholder="Min: ₦100"
                  class="w-full mb-2 p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
                <div v-if="transferAmount > accountBalance" class="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p class="text-red-600 text-sm">
                    Insufficient funds. Available balance: ₦{{ accountBalance.toLocaleString() }}
                  </p>
                </div>
                <input v-model="transferDesc" type="text" placeholder="Description (optional)"
                  class="w-full mb-4 p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </template>

              <!-- Transfer Button (only show after account validation) -->
              <button v-if="isAccountValidated" type="submit"
                class="w-full py-3 mb-2 rounded-md bg-black text-white font-semibold text-base cursor-pointer hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                :disabled="!canProceedToPin">
                Continue
              </button>

              <!-- Cancel Button -->
              <button type="button"
                class="w-full py-3 rounded-md bg-gray-200 text-black font-semibold text-base cursor-pointer hover:bg-gray-300 transition-colors"
                @click="closeTransferModal">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- PIN Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showPinModal"
        class="modal-overlay fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[60]"
        @click.self="closePinModal">
        <div class="modal bg-white rounded-xl p-6 max-w-[500px] w-full shadow-2xl transform-gpu">
          <h3 class="text-xl font-semibold mb-6 text-center">Confirm Transfer</h3>
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Recipient Name:</span>
              <span class="font-medium">{{ recipientName }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Recipient Bank:</span>
              <span class="font-medium">{{ selectedBankName }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Amount:</span>
              <span class="font-bold text-lg">₦{{ transferAmount?.toLocaleString() }}</span>
            </div>
            <div v-if="transferDesc" class="flex justify-between items-center">
              <span class="text-gray-600">Description:</span>
              <span class="font-medium">{{ transferDesc }}</span>
            </div>
          </div>

          <form>
            <div class="mb-4">
              <label class="block text-sm font-medium text-center text-gray-700 mb-3">Enter your 4-digit PIN</label>

              <!-- PIN Input Boxes -->
              <div class="flex justify-center gap-3 mb-2">
                <input v-for="(digit, index) in pinDigits" :key="index" :ref="el => pinInputs[index] = el"
                  v-model="pinDigits[index]" type="password" maxlength="1"
                  class="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  :class="{ 'border-red-500': pinError }" @input="handlePinInput(index, $event)"
                  @keydown="handlePinKeydown(index, $event)" @paste.prevent />
              </div>

              <div v-if="pinError" class="text-red-600 text-sm text-center">{{ pinError }}</div>
              <div v-if="loading" class="text-blue-600 text-sm text-center mt-2">Processing transfer...</div>
            </div>

            <button type="button"
              class="w-full py-3 rounded-md bg-gray-200 text-black font-semibold text-base cursor-pointer hover:bg-gray-300 transition-colors"
              @click="closePinModal">Cancel</button>
          </form>
        </div>
      </div>
    </transition>

    <!-- Deposit Modal -->
    <transition name="modal-fade">
      <div v-if="showDeposit"
        class="modal-overlay fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50"
        @click.self="closeDepositModal">
        <div class="modal bg-white rounded-xl p-6 max-w-[400px] shadow-2xl transform-gpu">
          <h3 class="text-xl font-semibold mb-4 text-center">Deposit Funds</h3>
          <form @submit.prevent="handleDeposit">
            <input v-model.number="depositAmount" type="number" min="100" placeholder="Amount (₦)"
              class="w-full mb-4 p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
            <input v-model="depositDesc" type="text" placeholder="Description (optional)"
              class="w-full mb-4 p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div class="flex flex-nowrap items-center gap-2">
              <button type="submit"
                class="w-full py-3 mb-2 rounded-md bg-black text-white font-semibold text-base cursor-pointer hover:bg-gray-800 transition-colors"
                :disabled="!isDepositValid || loading">
                <span v-if="loading">Processing...</span>
                <span v-else>Deposit</span>
              </button>
              <button type="button"
                class="w-full py-3 rounded-md bg-gray-200 text-black font-semibold text-base cursor-pointer hover:bg-gray-300 transition-colors"
                @click="closeDepositModal">Cancel</button>
            </div>
          </form>
          <div v-if="depositMsg"
            :class="['mt-2 text-center text-sm', depositSuccess ? 'text-green-600' : 'text-red-600']">
            {{ depositMsg }}
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, getCurrentInstance, nextTick, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/composables/useApi'
import { useTransactionEvents } from '@/composables/useTransactionEvents'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
const { emit } = getCurrentInstance()
const { emitTransactionCompleted } = useTransactionEvents()

const banks = ref([])
const showTransfer = ref(false)
const showPinModal = ref(false)
const selectedBank = ref('')
const transferAccount = ref('')
const transferAmount = ref(null)
const transferDesc = ref('')
const recipientName = ref('')
const recipientError = ref('')
const recipientLoading = ref(false)
const userStore = useUserStore()
const loading = ref(false)
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])
const pinError = ref('')
const accountNo = ref()
const accountBalance = ref(0)
const showDeposit = ref(false)
const depositAmount = ref(null)
const depositDesc = ref('')
const depositMsg = ref('')
const depositSuccess = ref(false)

// Define your bank name - update this to match your actual bank
const MY_BANK_NAME = 'Banka' // Change this to your actual bank name

const isAccountNumberValid = computed(() => /^\d{10}$/.test(transferAccount.value))
const isTransferAmountValid = computed(() => transferAmount.value >= 100)
const isDepositAmountValid = computed(() => depositAmount.value >= 100)
const isDepositValid = computed(() => isDepositAmountValid.value && !loading.value)
const isAccountValidated = computed(() => recipientName.value && !recipientError.value)
const canProceedToPin = computed(() =>
  isAccountValidated.value &&
  isTransferAmountValid.value &&
  !loading.value
)
const isPinComplete = computed(() => pinDigits.value.every(digit => digit !== '' && /^\d$/.test(digit)))
const isValidPin = computed(() => /^\d{4}$/.test(pinDigits.value.join('')))

const selectedBankName = computed(() => {
  const bank = banks.value.find(b => b.bankCode === selectedBank.value)
  return bank ? bank.bankName : ''
})

const isMyBank = computed(() => {
  return selectedBankName.value === MY_BANK_NAME
})

const myBanks = computed(() => {
  return banks.value.filter(bank => bank.bankName === MY_BANK_NAME)
})

const otherBanks = computed(() => {
  return banks.value.filter(bank => bank.bankName !== MY_BANK_NAME)
})

const userDetails = computed(() => userStore.profile)
const userAccount = computed(() => userStore.account)

const fetchAccount = async () => {
  try {
    await userStore.fetchAccount()
    accountBalance.value = userStore.account?.balance
    accountNo.value = userStore.account?.accountNumber
  } catch (err) {
    console.error('Error fetching account balance:', err)
    toast.error('Failed to fetch account balance')
  }
}

// Watch for changes in selectedBank to clear account-related fields
watch(selectedBank, () => {
  transferAccount.value = ''
  recipientName.value = ''
  recipientError.value = ''
  recipientLoading.value = false
  transferAmount.value = null
  transferDesc.value = ''
})

function selectBank(bank) {
  selectedBank.value = bank.bankCode
}

function goBackToBankSelection() {
  selectedBank.value = ''
  transferAccount.value = ''
  transferAmount.value = null
  transferDesc.value = ''
  recipientName.value = ''
  recipientError.value = ''
}

function closeTransferModal() {
  showTransfer.value = false
  setTimeout(() => {
    selectedBank.value = ''
    transferAccount.value = ''
    transferAmount.value = null
    transferDesc.value = ''
    recipientName.value = ''
    recipientError.value = ''
  }, 300)
}

const fetchBanks = async () => {
  try {
    const res = await api.get('banks/getbanks')
    banks.value = res.data
  } catch (err) {
    console.error('Error fetching banks:', err)
    toast.error('Failed to fetch bank list')
  }
}

const onAccountInput = async () => {
  recipientName.value = ''
  recipientError.value = ''
  if (isAccountNumberValid.value && selectedBank.value) {
    recipientLoading.value = true
    const bank = banks.value.find(b => b.bankCode === selectedBank.value)
    const bankName = bank ? bank.bankName : ''
    try {
      const result = await validateAccount(transferAccount.value, selectedBank.value, bankName)
      recipientLoading.value = false
      if (result && result.data?.accountName) {
        recipientName.value = result.data.accountName
        recipientError.value = ''
        recipientLoading.value = false;
      } else {
        recipientLoading.value = false;
        recipientName.value = ''
        recipientError.value = 'Invalid response from server'
      }
    } catch (err) {
      console.error('Error validating account:', err)
      recipientLoading.value = false;
      recipientName.value = ''
      recipientError.value = err?.response?.data?.error || 'Failed to validate account'
    }
  }
}

const validateAccount = async (accountNo, bankCode, bankName) => {
  try {
    const res = await api.post('banks/validate-account', {
      accountNumber: accountNo.toString(),
      bankCode,
      bankName
    })
    return res.data
  } catch (err) {
    console.error('Error validating account:', err)
    throw err
  }
}

onMounted(async () => {
  try {
    // If data is not loaded, fetch it
    if (!userStore.isProfileLoaded) {
      await userStore.fetchAllUserData()
    }

    if (userDetails.value?.accountId) {
      await fetchAccount()
    }
    await fetchBanks()
  } catch (err) {
    console.error('Error fetching initial data:', err)
    toast.error('Failed to fetch initial data')
  }
})

function showPinConfirmation() {
  if (!canProceedToPin.value) {
    if (transferAmount.value > userAccount.value?.balance) {
      toast.error(`Insufficient funds. Available balance: ₦${userAccount.value.balance.toLocaleString()}`)
    } else {
      toast.error('Please complete all required fields.')
    }
    return
  }
  showPinModal.value = true
  nextTick(() => {
    if (pinInputs.value[0]) {
      pinInputs.value[0].focus()
    }
  })
}

function closePinModal() {
  showPinModal.value = false
  pinDigits.value = ['', '', '', '']
  pinError.value = ''
}

function handlePinInput(index, event) {
  const value = event.target.value
  if (pinError.value) {
    pinError.value = ''
  }
  if (value && !/^\d$/.test(value)) {
    event.target.value = ''
    pinDigits.value[index] = ''
    return
  }

  pinDigits.value[index] = value
  if (value && index < 3) {
    nextTick(() => {
      if (pinInputs.value[index + 1]) {
        pinInputs.value[index + 1].focus()
      }
    })
  }

  // Auto-validate when all 4 digits are entered
  if (value && index === 3) {
    nextTick(() => {
      const pin = pinDigits.value.join('')
      if (isPinComplete.value && isValidPin.value) {
        handleTransfer()
      }
    })
  }
}

function handlePinKeydown(index, event) {
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    nextTick(() => {
      if (pinInputs.value[index - 1]) {
        pinInputs.value[index - 1].focus()
      }
    })
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    nextTick(() => {
      if (pinInputs.value[index - 1]) {
        pinInputs.value[index - 1].focus()
      }
    })
  }

  if (event.key === 'ArrowRight' && index < 3) {
    nextTick(() => {
      if (pinInputs.value[index + 1]) {
        pinInputs.value[index + 1].focus()
      }
    })
  }
}

const handleTransfer = async () => {
  const pin = pinDigits.value.join('')
  if (!isPinComplete.value || !isValidPin.value) {
    pinError.value = 'Please enter a valid 4-digit numeric PIN'
    return
  }
  loading.value = true
  pinError.value = ''
  const bank = banks.value.find(b => b.bankCode === selectedBank.value)
  const bankName = bank ? bank.bankName : ''
  try {
    const { data } = await api.post('/banks/transfer', {
      bankCode: selectedBank.value,
      bankName: bankName,
      accountNo: transferAccount.value,
      accountName: recipientName.value,
      amount: transferAmount.value,
      metadata: {
        purpose: transferDesc.value || 'Transfer',
        senderName: userDetails.value?.firstName + ' ' + userDetails.value?.lastName,
        senderAccount: accountNo.value,
      },
      pin: pin
    })
    toast.success(data?.message || 'Transfer successful!')
    emit('transaction-completed')
    // Emit global transaction event to refresh all transaction lists
    emitTransactionCompleted({
      type: 'transfer',
      amount: transferAmount.value,
      mode: 'DEBIT'
    })
    showPinModal.value = false
    showTransfer.value = false
    setTimeout(() => {
      selectedBank.value = ''
      transferAccount.value = ''
      transferAmount.value = null
      transferDesc.value = ''
      recipientName.value = ''
      recipientError.value = ''
      pinDigits.value = ['', '', '', '']
    }, 300)
    await fetchAccount()
    // Update free transactions count from response
    if (data?.data?.freeTransactionsLeft !== undefined) {
      userStore.freeTransactionsLeft = data.data.freeTransactionsLeft
    } else {
      // Fallback to fetching from server
      await userStore.fetchFreeTransactionsLeft(true)
    }
  } catch (err) {
    pinError.value = err.response?.data?.message || 'Invalid PIN or transfer failed'
    toast.error(pinError.value)
  } finally {
    loading.value = false
  }
}

function closeDepositModal() {
  showDeposit.value = false
  setTimeout(() => {
    depositAmount.value = null
    depositDesc.value = ''
    depositMsg.value = ''
    depositSuccess.value = false
  }, 300)
}

const handleDeposit = async () => {
  if (!isDepositValid.value) {
    toast.error('Please enter a valid deposit amount (₦100+).')
    return
  }

  loading.value = true
  depositMsg.value = ''
  depositSuccess.value = false

  try {
    const { data } = await api.post('/wallet/deposit/create-link', {
      amount: depositAmount.value,
      description: depositDesc.value
    })
    if (data?.data?.paymentUrl) {
      depositMsg.value = 'Redirecting to payment...'
      depositSuccess.value = true
      toast.success('Redirecting to payment gateway...')

      // Close the deposit modal first
      showDeposit.value = false

      // Emit global transaction event
      emitTransactionCompleted({
        type: 'deposit',
        amount: depositAmount.value,
        mode: 'CREDIT'
      })

      // Redirect to Paystack after a short delay
      setTimeout(() => {
        window.location.href = data.data.paymentUrl
      }, 500)
    } else {
      depositMsg.value = 'Deposit link created, but no payment URL.'
      depositSuccess.value = false
      toast.info(depositMsg.value)
    }
    await fetchAccount()
    // Refresh free transactions count after successful deposit
    await userStore.fetchFreeTransactionsLeft(true)
  } catch (err) {
    depositMsg.value = err.response?.data?.message || 'Deposit failed.'
    depositSuccess.value = false
    toast.error(depositMsg.value)
  } finally {
    loading.value = false
  }
}

async function refetchBalanceAndTransactions() {
  try {
    await fetchAccount()
    // Add fetchTransactions if available
    if (typeof fetchTransactions === 'function') {
      await fetchTransactions()
    }
  } catch (err) {
    console.error('Error refetching balance and transactions:', err)
    toast.error('Failed to refresh balance')
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

.modal-fade-enter-to .modal,
.modal-fade-leave-from .modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.bank-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bank-option {
  transition: all 0.2s ease-in-out;
}

/* PIN input styling */
input[type="password"]::-ms-reveal {
  display: none;
}

input[type="password"]::-webkit-textfield-decoration-container {
  display: none;
}
</style>