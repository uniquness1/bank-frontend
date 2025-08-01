<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div class="text-center">
                <!-- Success Icon -->
                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                <!-- Success Message -->
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                <p class="text-gray-600 mb-6">
                    Your deposit has been processed successfully. The funds will be credited to your account shortly.
                </p>

                <!-- Transaction Details -->
                <div v-if="transactionDetails" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Amount:</span>
                        <span class="font-semibold">₦{{ formatAmount(transactionDetails.amount) }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Reference:</span>
                        <span class="font-mono text-sm">{{ transactionDetails.reference }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Status:</span>
                        <span class="text-green-600 font-semibold">Success</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                    <button @click="goToDashboard"
                        class="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-800 transition-colors">
                        Go to Dashboard
                    </button>
                    <button @click="viewTransactions"
                        class="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-semibold hover:bg-gray-300 transition-colors">
                        View Transactions
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="mt-4">
                    <div class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <span class="text-gray-600">Verifying payment...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTransactionEvents } from '@/composables/useTransactionEvents'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { emitTransactionCompleted } = useTransactionEvents()

const loading = ref(true)
const transactionDetails = ref(null)

function formatAmount(amount) {
    if (!amount && amount !== 0) return '0.00'
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

function goToDashboard() {
    router.push('/dashboard')
}

function viewTransactions() {
    router.push('/transactions')
}

onMounted(async () => {
    try {
        // Get query parameters from Paystack callback
        const { reference, trxref, status } = route.query

        if (status === 'success' && reference) {
            // Set transaction details from URL params
            transactionDetails.value = {
                reference: reference || trxref,
                amount: route.query.amount ? parseFloat(route.query.amount) / 100 : null,
                status: 'success'
            }

            // Emit transaction completed event to refresh data
            emitTransactionCompleted({
                type: 'deposit',
                amount: transactionDetails.value.amount,
                mode: 'CREDIT',
                reference: transactionDetails.value.reference
            })

            // Refresh user data
            await userStore.fetchAccount(true)

            toast.success('Deposit successful! Your account has been credited.')
        } else {
            // Handle failed payment
            toast.error('Payment was not successful. Please try again.')
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        }
    } catch (error) {
        console.error('Error processing deposit success:', error)
        toast.error('Error processing payment. Please contact support.')
    } finally {
        loading.value = false
    }
})
</script>