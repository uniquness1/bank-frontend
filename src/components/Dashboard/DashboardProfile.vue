<template>
  <div class="flex items-center justify-between pt-4">
    <div class="flex items-center gap-4">
      <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p class="font-medium text-xl text-[#121212]">Hi {{ UserDetails.firstName }}</p>
    </div>
    <div>
      <i class="fas fa-message text-2xl cursor-pointer"></i>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const UserDetails = computed(() => userStore.profile || {})
</script>