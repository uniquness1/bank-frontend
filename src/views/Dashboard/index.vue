<template>
  <section class="flex h-screen max-w-[2000px] mx-auto w-full">
    <Sidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />
    <div class="flex-1 flex flex-col min-h-0">
      <div class="flex-1 overflow-y-auto max-w-5xl 2xl:max-w-7xl mx-auto w-full">
        <div class="dashboard">
          <DashboardProfile />
          <DashboardAccountInfo />
          <DashboardSavingsSummary />
          <DashboardTransactions :limit="5" />
        </div>
      </div>
    </div>
    <Ads />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import DashboardAccountInfo from '@/components/Dashboard/DashboardAccountInfo.vue'
import DashboardProfile from '@/components/Dashboard/DashboardProfile.vue'
import DashboardTransactions from '@/components/Dashboard/DashboardTransactions.vue'
import DashboardNotifications from '@/components/Dashboard/DashboardNotifications.vue'
import DashboardSavingsSummary from '@/components/Dashboard/DashboardSavingsSummary.vue'
import Sidebar from '@/components/utils/Sidebar.vue'
import Ads from '@/components/utils/Ads.vue'

const userStore = useUserStore()
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isSidebarOpen.value = false
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)

  // Fetch user data once when dashboard loads
  try {
    await userStore.fetchAllUserData()
  } catch (err) {
    console.error('Error fetching user data:', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

@media (min-width: 1024px) {
  .sidebar-fixed {
    position: relative !important;
    transform: translateX(0) !important;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}
</style>