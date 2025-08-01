import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/useApi'

export const useUserStore = defineStore('user', () => {
  // State
  const profile = ref(null)
  const account = ref(null)
  const freeTransactionsLeft = ref(null)
  const isLoading = ref(false)
  const lastFetched = ref(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Computed
  const isProfileLoaded = computed(() => profile.value !== null)
  const isAccountLoaded = computed(() => account.value !== null)
  const isDataStale = computed(() => {
    if (!lastFetched.value) return true
    return Date.now() - lastFetched.value > CACHE_DURATION
  })

  // Actions
  const fetchProfile = async (force = false) => {
    if (isProfileLoaded.value && !force && !isDataStale.value) {
      return profile.value
    }

    isLoading.value = true
    try {
      const res = await api.get('/user/profile')
      profile.value = res.data
      lastFetched.value = Date.now()
      return profile.value
    } catch (err) {
      console.error('Error fetching profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAccount = async (force = false) => {
    if (isAccountLoaded.value && !force && !isDataStale.value) {
      return account.value
    }

    if (!profile.value?.accountId) {
      await fetchProfile()
    }

    isLoading.value = true
    try {
      const res = await api.get(`/user/account/${profile.value.accountId}`)
      account.value = res.data
      lastFetched.value = Date.now()
      return account.value
    } catch (err) {
      console.error('Error fetching account:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchFreeTransactionsLeft = async (force = false) => {
    if (freeTransactionsLeft.value !== null && !force && !isDataStale.value) {
      return freeTransactionsLeft.value
    }

    try {
      const res = await api.get('/wallet/free-transactions-left')
      freeTransactionsLeft.value = res.data.data.freeTransactionsLeft
      return freeTransactionsLeft.value
    } catch (err) {
      console.error('Error fetching free transactions left:', err)
      throw err
    }
  }

  const fetchAllUserData = async (force = false) => {
    try {
      await Promise.all([
        fetchProfile(force),
        fetchAccount(force),
        fetchFreeTransactionsLeft(force),
      ])
    } catch (err) {
      console.error('Error fetching user data:', err)
      throw err
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/user/profile', profileData)
      profile.value = res.data
      lastFetched.value = Date.now()
      return profile.value
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  const updateAccountBalance = (newBalance) => {
    if (account.value) {
      account.value.balance = newBalance
    }
  }

  const clearUserData = () => {
    profile.value = null
    account.value = null
    freeTransactionsLeft.value = null
    lastFetched.value = null
  }

  return {
    // State
    profile,
    account,
    freeTransactionsLeft,
    isLoading,

    // Computed
    isProfileLoaded,
    isAccountLoaded,
    isDataStale,

    // Actions
    fetchProfile,
    fetchAccount,
    fetchFreeTransactionsLeft,
    fetchAllUserData,
    updateProfile,
    updateAccountBalance,
    clearUserData,
  }
})
