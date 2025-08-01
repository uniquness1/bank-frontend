<template>
  <section class="flex h-screen mb-20 md:mb-0">
    <Sidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />
    <div class="flex-1 flex flex-col min-h-0 px-4 py-10">
      <div class="flex-1 overflow-y-auto max-w-5xl w-full">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 class="text-lg font-semibold mb-4">Change PIN</h2>
          <form @submit.prevent="handleChangePin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Old PIN</label>
              <input v-model="oldPin" type="password" maxlength="4" pattern="\d{4}"
                class="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">New PIN</label>
              <input v-model="newPin" type="password" maxlength="4" pattern="\d{4}"
                class="border rounded px-2 py-1 w-full" required />
            </div>
            <button type="submit" class="px-4 py-2 rounded bg-black text-white w-full" :disabled="loading">
              {{ loading ? 'Changing...' : 'Change PIN' }}
            </button>
            <p v-if="successMsg" class="text-green-600 text-center mt-2">{{ successMsg }}</p>
            <p v-if="errorMsg" class="text-red-600 text-center mt-2">{{ errorMsg }}</p>
          </form>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold mb-4">Update Profile</h2>
          <form @submit.prevent="handleProfileUpdate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">First Name</label>
              <input v-model="profile.firstName" type="text" class="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Last Name</label>
              <input v-model="profile.lastName" type="text" class="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input v-model="profile.email" readonly type="text" class="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Username</label>
              <input v-model="profile.userName" type="text" class="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Phone</label>
              <input v-model="profile.phone" type="tel" class="border rounded px-2 py-1 w-full" required />
            </div>
            <button type="submit" class="px-4 py-2 rounded bg-black text-white w-full" :disabled="profileLoading">
              {{ profileLoading ? 'Updating...' : 'Update Profile' }}
            </button>
            <p v-if="profileSuccess" class="text-green-600 text-center mt-2">{{ profileSuccess }}</p>
            <p v-if="profileError" class="text-red-600 text-center mt-2">{{ profileError }}</p>
          </form>
        </div>
      </div>
    </div>
    <Ads />
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/composables/useApi'
import Cookies from 'js-cookie'
import Sidebar from '@/components/utils/Sidebar.vue'
import Ads from '@/components/utils/Ads.vue'

const oldPin = ref('')
const newPin = ref('')
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')


const userStore = useUserStore()

// Profile update state
const profile = ref({
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  phone: ''
})
const profileLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
const closeSidebar = () => {
  isSidebarOpen.value = false
}
async function fetchProfile() {
  profileLoading.value = true
  try {
    // Use store data if available, otherwise fetch
    if (userStore.isProfileLoaded) {
      const storeProfile = userStore.profile
      profile.value = {
        firstName: storeProfile.firstName || '',
        lastName: storeProfile.lastName || '',
        userName: storeProfile.userName || '',
        email: storeProfile.email || '',
        phone: storeProfile.phone || ''
      }
    } else {
      await userStore.fetchProfile()
      const storeProfile = userStore.profile
      profile.value = {
        firstName: storeProfile.firstName || '',
        lastName: storeProfile.lastName || '',
        userName: storeProfile.userName || '',
        email: storeProfile.email || '',
        phone: storeProfile.phone || ''
      }
    }
  } catch (err) {
    profileError.value = 'Failed to fetch profile.'
  } finally {
    profileLoading.value = false
  }
}
onMounted(fetchProfile)

async function handleChangePin() {
  successMsg.value = ''
  errorMsg.value = ''
  if (!/^\d{4}$/.test(oldPin.value) || !/^\d{4}$/.test(newPin.value)) {
    errorMsg.value = 'Both PINs must be 4 digits.'
    return
  }
  loading.value = true
  try {
    const token = Cookies.get('authToken')
    await api.post('/auth/change-pin', { oldPin: oldPin.value, newPin: newPin.value }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    successMsg.value = 'PIN changed successfully.'
    oldPin.value = ''
    newPin.value = ''
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to change PIN.'
  } finally {
    loading.value = false
  }
}

async function handleProfileUpdate() {
  profileSuccess.value = ''
  profileError.value = ''
  profileLoading.value = true
  try {
    // Update profile in store
    await userStore.updateProfile(profile.value)
    profileSuccess.value = 'Profile updated successfully.'
  } catch (err) {
    profileError.value = err.response?.data?.error || 'Failed to update profile.'
  } finally {
    profileLoading.value = false
  }
}

</script>