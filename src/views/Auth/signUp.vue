<template>
    <section>
        <Header />
        <section class="bg-gray-50">
            <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                <div class="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8 sm:py-16 lg:py-0">
                    <div class="w-full max-w-sm mx-auto 2xl:max-w-md">
                        <h2 class="text-2xl lg:text-3xl font-bold text-[#121212] mb-3">
                            Create Account
                        </h2>
                        <p class="text-[#121212] leading-relaxed">
                            Create a banka profile with few details. Your password must be at least 8 characters
                            including
                            letters and a number.
                        </p>
                        <form @submit.prevent="handleSignup" class="mt-6 space-y-4">
                            <div>
                                <label for="email" class="text-base font-medium text-[#121212]">
                                    Email address
                                </label>
                                <div class="mt-1">
                                    <input v-model="form.email" type="email" id="email" autocomplete="email"
                                        placeholder="yourname@email.com"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:outline-none"
                                        :class="{ 'border-red-500 focus:ring-red-500': errors.email }" />
                                    <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
                                </div>
                            </div>

                            <div>
                                <label for="password" class="text-base font-medium text-gray-900">
                                    Password
                                </label>
                                <div class="mt-1 relative">
                                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                        id="password" autocomplete="new-password" placeholder="Enter your password"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc]  border rounded-md outline-none focus:outline-none"
                                        :class="{ 'border-red-500 focus:ring-red-500': errors.password }" />
                                    <button type="button" @click="togglePasswordVisibility"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                        <i v-if="showPassword" class="fa-solid fa-eye text-[#121212]"></i>
                                        <i v-else class="fa-solid fa-eye-slash text-[#121212]"></i>
                                    </button>
                                </div>
                                <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
                            </div>

                            <div>
                                <label for="confirmPassword" class="text-base font-medium text-gray-900 ">
                                    Confirm Password
                                </label>
                                <div class="mt-1 relative">
                                    <input v-model="form.confirmPassword"
                                        :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                                        autocomplete="new-password" placeholder="Confirm your password"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc]  border rounded-md outline-none focus:outline-none"
                                        :class="{ 'border-red-500 focus:ring-red-500': errors.confirmPassword }" />
                                    <button type="button" @click="toggleConfirmPasswordVisibility"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        <i v-if="showConfirmPassword" class="fa-solid fa-eye text-[#121212]"></i>
                                        <i v-else class="fa-solid fa-eye-slash text-[#121212]"></i>
                                    </button>
                                </div>
                                <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">{{
                                    errors.confirmPassword
                                }}</p>
                            </div>
                            <div>
                                <button type="submit"
                                    class="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-black rounded-md  disabled:cursor-not-allowed cursor-pointer"
                                    :disabled="loading || !isFormValid">
                                    {{ loading ? 'Creating Account...' : 'Create account' }}
                                </button>
                            </div>
                        </form>
                        <p class="mt-2 text-base text-gray-600">
                            Already have an account?
                            <router-link to="/login"
                                class="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                Log in
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
    confirmPassword: '',
})
const errors = ref({})
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value
}

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const validatePassword = (password) => {
    const hasMinLength = password.length >= 8
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    return hasMinLength && hasLetter && hasNumber
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
    } else if (!validatePassword(newPassword)) {
        errors.value.password = 'Password must be at least 8 characters including letters and a number'
    } else {
        delete errors.value.password
    }

    if (form.value.confirmPassword && form.value.confirmPassword !== newPassword) {
        errors.value.confirmPassword = 'Passwords do not match'
    } else if (form.value.confirmPassword && form.value.confirmPassword === newPassword) {
        delete errors.value.confirmPassword
    }
})

watch(() => form.value.confirmPassword, (newConfirmPassword) => {
    if (newConfirmPassword === '') {
        delete errors.value.confirmPassword
    } else if (newConfirmPassword !== form.value.password) {
        errors.value.confirmPassword = 'Passwords do not match'
    } else {
        delete errors.value.confirmPassword
    }
})

const isFormValid = computed(() => {
    return (
        form.value.email &&
        form.value.password &&
        form.value.confirmPassword &&
        Object.keys(errors.value).length === 0 &&
        validateEmail(form.value.email) &&
        validatePassword(form.value.password) &&
        form.value.password === form.value.confirmPassword
    )
})

const handleSignup = async () => {
    if (!isFormValid.value) return
    loading.value = true
    error.value = ''
    try {
        const response = await api.post('/auth/signup', {
            email: form.value.email,
            password: form.value.password,
            confirmPassword: form.value.confirmPassword,
        }, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
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
        toast.success('Account created successfully!', {
            autoClose: 2000,
            position: 'bottom-right',
        })
        setTimeout(() => {
            router.push('/complete-profile')
        }, 2000)
    } catch (err) {
        console.log(err)
        const message = err.response?.data?.error || 'Signup failed. Please check your input.'
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