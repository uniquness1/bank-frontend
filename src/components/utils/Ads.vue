<template>
    <div class="hidden lg:block w-[350px] border-l border-gray-200 relative overflow-hidden">
        <div class="h-full flex items-center justify-center text-white relative transition-all duration-1000 ease-in-out"
            :class="currentService.bgClass">
            <!-- Animated background elements -->
            <div class="absolute inset-0 opacity-20">
                <div class="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                <div class="absolute bottom-20 right-10 w-16 h-16 bg-white rounded-full animate-pulse delay-500"></div>
                <div class="absolute top-1/2 left-5 w-12 h-12 bg-white rounded-full animate-pulse delay-1000"></div>
            </div>

            <!-- Content -->
            <div class="relative z-10 p-8 text-center">
                <div class="mb-6">
                    <div
                        class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"
                            v-html="currentService.icon"></svg>
                    </div>
                    <h2 class="text-3xl font-bold mb-2">{{ currentService.title }}</h2>
                    <p class="text-lg opacity-90">{{ currentService.subtitle }}</p>
                </div>

                <div class="space-y-4">
                    <div v-for="(feature, index) in currentService.features" :key="index"
                        class="flex items-center justify-center space-x-3 animate-fadeIn"
                        :style="{ animationDelay: `${index * 200}ms` }">
                        <div class="w-2 h-2 bg-white rounded-full"></div>
                        <span class="text-sm">{{ feature }}</span>
                    </div>
                </div>

                <div class="mt-8">
                    <div class="text-4xl font-bold mb-2">{{ currentService.highlight }}</div>
                    <div class="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-full inline-block">
                        {{ currentService.badge }}
                    </div>
                </div>
            </div>

            <!-- Progress indicator -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <div v-for="(service, index) in services" :key="index"
                    class="w-2 h-2 rounded-full transition-all duration-300"
                    :class="index === currentServiceIndex ? 'bg-white' : 'bg-white bg-opacity-30'"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const currentServiceIndex = ref(0)

const services = ref([
    {
        title: 'Premium Banking',
        subtitle: 'Exclusive Benefits Await',
        bgClass: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
        icon: '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
        features: ['Zero monthly fees', 'Unlimited transactions', 'Premium customer support'],
        highlight: '0% APR',
        badge: 'Limited Time'
    },
    {
        title: 'Smart Investments',
        subtitle: 'Grow Your Wealth',
        bgClass: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>',
        features: ['AI-powered portfolio', 'Diversified assets', 'Real-time analytics'],
        highlight: '8.5% Returns',
        badge: 'Expected Annual'
    },
    {
        title: 'Digital Wallet',
        subtitle: 'Pay Anywhere, Anytime',
        bgClass: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/>',
        features: ['Contactless payments', 'Instant transfers', 'Reward points'],
        highlight: '2x Cashback',
        badge: 'On All Purchases'
    },
    {
        title: 'Savings Goals',
        subtitle: 'Dream. Save. Achieve.',
        bgClass: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>',
        features: ['Auto-save features', 'Progress tracking', 'Goal recommendations'],
        highlight: '$10,000',
        badge: 'Average Goal Met'
    },
    {
        title: 'Business Banking',
        subtitle: 'Power Your Business',
        bgClass: 'bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
        features: ['Multi-user access', 'Expense management', 'Invoice automation'],
        highlight: 'Free Setup',
        badge: 'No Hidden Fees'
    }
])

const currentService = ref(services.value[0])

let serviceInterval

const startServiceRotation = () => {
    serviceInterval = setInterval(() => {
        currentServiceIndex.value = (currentServiceIndex.value + 1) % services.value.length
        currentService.value = services.value[currentServiceIndex.value]
    }, 5000) // Change every 4 seconds
}

const stopServiceRotation = () => {
    if (serviceInterval) {
        clearInterval(serviceInterval)
    }
}
onMounted(() => {
    startServiceRotation()
})

onUnmounted(() => {
    stopServiceRotation()
})
</script>

<style></style>