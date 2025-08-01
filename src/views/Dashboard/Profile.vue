<template>
    <section class="flex h-screen border-nonew-full mb-20 md:mb-0">
        <Sidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />
        <div class="flex-1 overflow-y-auto">
            <DashboardProfile class="py-4 mx-4" />
            <div class="flex flex-col items-center justify-center min-h-0 px-4 py-6">
                <div class="border rounded-full w-32 h-32 flex items-center justify-center text-5xl text-gray-600">
                    <i class="fas fa-user"></i>
                </div>
                <p class="text-[#121212] mt-2">{{ UserDetails.userName }}</p>
                <div class="border border-gray-200 py-4 px-6 w-full mt-4 flex flex-col gap-6">
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-10">
                        <h2 class="max-w-[200px] w-full">Banka Account Number</h2>
                        <div class="">
                            <span v-if="account?.accountNumber"
                                class="flex items-center gap-2 text-[#121212] font-light">
                                {{ account.accountNumber }}
                                <i class="far fa-copy cursor-pointer" @click="copyAccountNumber"
                                    :title="copySuccess ? 'Copied!' : 'Copy account number'"></i>
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-10">
                        <h2 class="max-w-[200px] w-full">FullName</h2>
                        <div class="">
                            <span class="flex items-center gap-2 text-[#121212] font-light">
                                {{ UserDetails.firstName }} {{ UserDetails.lastName }}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-10">
                        <h2 class="max-w-[200px] w-full">Phone Number</h2>
                        <div class="">
                            <span class="flex items-center gap-2 text-[#121212] font-light">
                                {{ UserDetails.phone }}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-10">
                        <h2 class="max-w-[200px] w-full">Username</h2>
                        <div class="">
                            <span class="flex items-center gap-2 text-[#121212] font-light">
                                {{ UserDetails.userName }}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-10 mb-10 md:mb-0">
                        <h2 class="max-w-[200px] w-full">Email</h2>
                        <div class="">
                            <span class="flex items-center gap-2 text-[#121212] font-light">
                                {{ UserDetails.email }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Ads />
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import Sidebar from '@/components/utils/Sidebar.vue'
import Ads from '@/components/utils/Ads.vue'
import DashboardProfile from '@/components/Dashboard/DashboardProfile.vue'


const userStore = useUserStore()
const UserDetails = computed(() => userStore.profile || {})
const account = computed(() => userStore.account)
const copySuccess = ref(false)

const copyAccountNumber = async () => {
    if (!account.value?.accountNumber) return

    try {
        await navigator.clipboard.writeText(account.value.accountNumber)
        copySuccess.value = true
        setTimeout(() => {
            copySuccess.value = false
        }, 2000)
    } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = account.value.accountNumber
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        copySuccess.value = true
        setTimeout(() => {
            copySuccess.value = false
        }, 2000)
    }
}

onMounted(async () => {
    try {
        // If data is not loaded, fetch it
        if (!userStore.isProfileLoaded) {
            await userStore.fetchAllUserData()
        }
    } catch (err) {
        console.log(err)
    }
})
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

onMounted(() => {
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style></style>