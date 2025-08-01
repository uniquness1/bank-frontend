<template>
    <section>
        <div v-if="isSidebarOpen" class="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 lg:hidden" @click="closeSidebar"></div>
        <div :class="[
            'fixed lg:relative z-50 lg:z-auto',
            'w-[300px] md:w-[400px] lg:w-[250px] h-full bg-gray-50 border-r border-gray-200',
            'transform transition-transform duration-300 ease-in-out',
            'lg:transform-none',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]">
            <div class="flex items-center justify-between px-2 py-4 border-gray-200">
                <div class="h-10 w-38">
                    <img src="../../assets/img/banka.png" alt="Banka Logo" class="h-full w-full object-cover" />
                </div>
                <button @click="closeSidebar" class="p-2 rounded-md hover:bg-gray-100 lg:hidden">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
            </div>
            <div class="py-6 px-10 flex flex-col min-h-[80dvh] justify-between gap-4">
                <div class="flex flex-col gap-4">
                    <router-link to="/dashboard"
                        class="text-[#121212] text-lg font-normal flex items-center gap-2 hover:text-[#072050]">
                        <i class="fas fa-home"></i>
                        Dashboard</router-link>
                    <router-link to="/transactions"
                        class="text-[#121212] text-lg font-normal flex items-center gap-2 hover:text-[#072050]">
                        <i class="fas fa-briefcase"></i>
                        Transactions</router-link>
                    <router-link to="/Savings"
                        class="text-[#121212] text-lg font-normal flex items-center gap-2 hover:text-[#072050]">
                        <i class="fas fa-landmark"></i>
                        Savings</router-link>
                    <router-link to="/profile"
                        class="text-[#121212] text-lg font-normal flex items-center gap-2 hover:text-[#072050]">
                        <i class="fas fa-user"></i>
                        Profile</router-link>
                    <!-- <router-link to="/cards"
                        class="text-[#121212] text-lg font-normal flex items-center gap-2 hover:text-[#072050]">
                        <i class="fas fa-credit-card"></i>
                        Cards</router-link> -->
                    <router-link to="/settings"
                        class="text-[#121212] text-lg font-normal flex items-center gap-2 hover:text-[#072050]">
                        <i class="fas fa-gears"></i>
                        Settings</router-link>
                </div>
                <p class="cursor-pointer text-lg font-normal flex items-center gap-2" @click="logout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Logout
                </p>
            </div>
        </div>
        <div class="lg:hidden fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 py-6 px-10">
            <div class="flex justify-between gap-2">
                <router-link to="/dashboard" class="flex flex-col items-center text-gray-600 hover:text-[#072050]">
                    <i class="fas fa-home text-black text-3xl"></i>
                </router-link>
                <router-link to="/transactions" class="flex flex-col items-center text-gray-600 hover:text-[#072050]">
                    <i class="far fa-paper-plane text-black text-3xl"></i>
                </router-link>
                <router-link to="/savings" class="flex flex-col items-center text-gray-600 hover:text-[#072050]">
                    <i class="fas fa-landmark text-black text-3xl"></i>
                </router-link>
                <router-link to="/profile" class="flex flex-col items-center text-gray-600 hover:text-[#072050]">
                    <i class="fas fa-user text-black text-3xl"></i>
                </router-link>
                <router-link to="/Settings" class="flex flex-col items-center text-gray-600 hover:text-[#072050]">
                    <i class="fas fa-gear text-black text-3xl"></i>
                </router-link>
            </div>
        </div>
    </section>
</template>

<script setup>
import Cookies from 'js-cookie'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const logout = async () => {
    Cookies.remove('authToken')
    toast.success('Logged out successfully')
    setTimeout(() => {
        router.push('/login')
    }, 1000)
}
defineProps({
    isSidebarOpen: Boolean
})

const emit = defineEmits(['closeSidebar'])

const closeSidebar = () => {
    emit('closeSidebar')
}
</script>

<style scoped>
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