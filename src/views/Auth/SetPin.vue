<template>
  <section>
    <div class="min-h-screen flex items-center justify-center">
      <div class="sm:px-6 lg:px-8 p-8 w-full max-w-md">
        <h2 class="text-2xl lg:text-3xl font-bold text-[#121212] mb-3">Set Your PIN</h2>
        <p class="text-[#121212] leading-relaxed">Create a 4-digit transaction PIN. Keep it safe you'll need this to
          complete all transactions.</p>
        <form @submit.prevent="handleSetPin" class="mt-6 space-y-6">
          <div>
            <div class="grid grid-cols-4 gap-2" @click="focusInput">
              <div v-for="index in 4" :key="index"
                class="w-full h-16 flex items-center justify-center text-lg font-medium text-[#121212] border rounded-md cursor-pointer relative"
                :class="{
                  'border-gray-300': !errors.pin,
                  'border-red-500': errors.pin,
                  'bg-white': true,
                  'border-black': pin.length + 1 === index && !errors.pin,
                  'ring-2 ring-black ring-opacity-50': pin.length + 1 === index && !errors.pin
                }">
                <span v-if="pin[index - 1]" class="text-2xl">●</span>
                <span v-else-if="pin.length + 1 === index && isInputFocused"
                  class="animate-pulse text-[#121212] text-xl font-bold">
                  |
                </span>
              </div>
            </div>
            <input v-model="pin" type="text" id="pin" inputmode="numeric" pattern="[0-9]*"
              class="absolute opacity-0 w-0 h-0 pointer-events-none" maxlength="4" autocomplete="off" required
              @input="validatePin" @focus="isInputFocused = true" @blur="isInputFocused = false" ref="pinInput" />
            <p v-if="errors.pin" class="text-red-500 text-xs mt-2 text-center">{{ errors.pin }}</p>
          </div>
          <button type="submit"
            class="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-black rounded-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            :disabled="loading || pin.length !== 4">
            {{ loading ? 'Setting PIN...' : 'Set PIN' }}
          </button>
        </form>
        <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'
import Cookies from 'js-cookie'

const router = useRouter()
const pin = ref('')
const errors = ref({})
const error = ref('')
const loading = ref(false)
const pinInput = ref(null)
const isInputFocused = ref(false)

const focusInput = () => {
  pinInput.value?.focus()
}

const validatePin = () => {
  errors.value = {}
  pin.value = pin.value.replace(/\D/g, '').slice(0, 4)
  if (pin.value.length > 0 && !/^\d+$/.test(pin.value)) {
    errors.value.pin = 'PIN must be digits only'
  }
}

const handleSetPin = async () => {
  if (pin.value.length !== 4) {
    errors.value.pin = 'PIN must be 4 digits'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const token = Cookies.get('authToken')
    if (!token) throw new Error('No authentication token found')

    await api.post(
      '/auth/set-pin',
      { pin: pin.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    router.push('/dashboard')
  } catch (err) {
    console.error('Set PIN error:', err.message, err.response?.data)
    error.value = err.response?.data?.error || 'Failed to set PIN'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  pinInput.value?.focus()
})
</script>