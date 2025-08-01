<template>
  <section class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-semibold">Savings Summary</h2>
      <router-link to="/savings" class="text-blue-600 hover:underline text-sm">View All</router-link>
    </div>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <div class="text-2xl font-bold text-[#072050]">₦{{ totalBalance.toLocaleString() }}</div>
      <div class="text-sm text-gray-600">Total Savings Balance</div>
      <div class="mt-2 text-sm text-gray-700">Active Goals: <span class="font-semibold">{{ activeCount }}</span></div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/composables/useApi'
import Cookies from 'js-cookie'

const savings = ref([])
const loading = ref(false)
const error = ref('')

const totalBalance = computed(() => savings.value.reduce((sum, s) => sum + (s.balance || 0), 0))
const activeCount = computed(() => savings.value.filter(s => s.status === 'active').length)

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
</script> 