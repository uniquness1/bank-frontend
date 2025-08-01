<template>
  <section>
    <Header />
    <section class="bg-gray-50">
      <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[90dvh] md:min-h-screen">
        <div class="flex items-center justify-center px-4 py-0 sm:px-6 lg:px-8 sm:py-16 lg:py-0">
          <div class="w-full max-w-sm mx-auto 2xl:max-w-md">
            <h2 class="text-2xl lg:text-3xl font-bold text-[#121212] mb-3">
              Sign In to Banka
            </h2>
            <p class="text-[#121212] leading-relaxed">
              Enter your email and password to access your account.
            </p>
            <form @submit.prevent="handleSignIn" class="mt-6 space-y-4">
              <div>
                <label for="email" class="text-base font-medium text-[#121212]">
                  Email address
                </label>
                <div class="mt-1">
                  <input v-model="form.email" type="email" id="email" autocomplete="email"
                    placeholder="Enter your email"
                    class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:border-blue-600"
                    :class="{ 'border-red-500 focus:ring-red-500': errors.email }" />
                  <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
                </div>
              </div>

              <div>
                <label for="password" class="text-base font-medium text-[#121212]">
                  Password
                </label>
                <div class="mt-1 relative">
                  <input v-model="form.password" :type="showPassword ? 'text' : 'password'" id="password"
                    autocomplete="current-password" placeholder="Enter your password"
                    class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:border-blue-600 pr-12"
                    :class="{ 'border-red-500 focus:ring-red-500': errors.password }" />
                  <button type="button" @click="togglePasswordVisibility"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
              </div>

              <div>
                <button type="submit"
                  class="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-[#072050] rounded-md disabled:cursor-not-allowed cursor-pointer"
                  :disabled="loading || !isFormValid">
                  {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>
              </div>
            </form>
            <p class="mt-2 text-base text-gray-600">
              Don't have an account?
              <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Create account
              </router-link>
            </p>
          </div>
        </div>
        <div class="hidden md:block max-h-[100vh]">
          <img class="w-[80%] h-full" src="../../assets/img/hero.png" alt="Banka Flowers" />
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'
import Cookies from 'js-cookie'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import Header from '@/components/utils/Header.vue'

const router = useRouter()
const form = ref({
  email: '',
  password: '',
})
const errors = ref({})
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

watch(() => form.value.email, (newEmail) => {
  if (newEmail === '') {
    delete errors.value.email
  } else if (!validateEmail(newEmail)) {
    errors.value.email = 'Invalid email address'
  } else {
    delete errors.value.email
  }
})

watch(() => form.value.password, (newPassword) => {
  if (newPassword === '') {
    delete errors.value.password
  } else {
    delete errors.value.password
  }
})

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    Object.keys(errors.value).length === 0 &&
    validateEmail(form.value.email)
  )
})

const handleSignIn = async () => {
  if (!isFormValid.value) return
  loading.value = true
  error.value = ''
  try {
    const response = await api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password,
    }, {
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.data.token) {
      throw new Error('No token received')
    }
    Cookies.set('authToken', response.data.token, {
      sameSite: 'Lax',
      secure: false,
      path: '/',
      expires: 1 / 24, // 1 hour (1/24 of a day)
    })
    toast.success('Signed in successfully! Redirecting...', {
      autoClose: 2000,
      position: 'bottom-right',
    })
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err) {
    const message = err.response?.data?.error || 'Sign-in failed. Please check your credentials.'
    toast.error(message, {
      autoClose: 4000,
      position: 'bottom-right',
    })
    error.value = message
  } finally {
    loading.value = false
  }
}
</script>