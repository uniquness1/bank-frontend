<template>
  <section class="bg-white">
    <div class="min-h-screen flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 mb-4 text-center">Verify Your Email</h2>
        <p class="text-gray-600 text-center mb-6">
          We've sent a verification link to your email. Please check your inbox and click the verification link.
        </p>

        <div class="space-y-4">
          <button
            @click="checkVerification"
            :disabled="checking"
            class="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ checking ? 'Checking...' : 'I\'ve verified my email' }}
          </button>

          <button
            @click="resendVerification"
            :disabled="resending"
            class="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {{ resending ? 'Sending...' : 'Resend verification email' }}
          </button>

          <div class="text-center">
            <button @click="goToLogin" class="text-blue-600 hover:text-blue-500">
              Back to login
            </button>
          </div>
        </div>

        <div v-if="message" class="mt-4 p-4 rounded-md" :class="messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">
          {{ message }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'
import { toast } from 'vue3-toastify'

const router = useRouter()
const checking = ref(false)
const resending = ref(false)
const message = ref('')
const messageType = ref('')

const checkVerification = async () => {
  checking.value = true
  message.value = ''
  
  try {
    const response = await api.post('/auth/verify-email')
    
    if (response.data.emailVerified) {
      message.value = 'Email verified successfully! Redirecting...'
      messageType.value = 'success'
      
      toast.success('Email verified successfully!', {
        autoClose: 2000,
        position: 'bottom-right',
      })
      
      setTimeout(() => {
        router.push('/complete-profile')
      }, 2000)
    } else {
      message.value = 'Email not verified yet. Please check your email.'
      messageType.value = 'error'
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || 'Failed to verify email'
    message.value = errorMsg
    messageType.value = 'error'
  } finally {
    checking.value = false
  }
}

const resendVerification = async () => {
  resending.value = true
  message.value = ''
  
  try {
    await api.post('/auth/resend-verification')
    message.value = 'Verification email sent successfully!'
    messageType.value = 'success'
    
    toast.success('Verification email sent!', {
      autoClose: 3000,
      position: 'bottom-right',
    })
  } catch (error) {
    const errorMsg = error.response?.data?.error || 'Failed to send verification email'
    message.value = errorMsg
    messageType.value = 'error'
  } finally {
    resending.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>