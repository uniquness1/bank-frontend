<template>
    <header class="w-full z-40 shadow-sm bg-gray-50">
        <div class="max-w-[1450px] mx-auto w-full p-4 flex items-center justify-between relative">
            <div class="flex items-center gap-6">
                <div class="h-10 w-38">
                    <img src="../../assets/img/banka.png" alt="Banka Logo" class="h-full w-full object-cover" />
                </div>
                <!-- Desktop navigation -->
                <nav class="hidden md:flex items-center gap-6">
                    <router-link to="#"
                        class="text-[#121212] hover:text-[#1a3a6b] transition-colors">Personal</router-link>
                    <router-link to="#"
                        class="text-[#121212] hover:text-[#1a3a6b] transition-colors">Business</router-link>
                    <router-link to="#"
                        class="text-[#121212] hover:text-[#1a3a6b] transition-colors">Company</router-link>
                    <router-link to="/settings" class="text-[#121212] hover:text-[#1a3a6b] transition-colors">Settings</router-link>
                </nav>
            </div>
            <!-- Mobile menu button -->
            <div class="md:hidden">
                <button @click="toggleMenu" class="text-[#072050] focus:outline-none z-50 relative">
                    <svg class="w-6 h-6 transition-transform duration-300" :class="{ 'rotate-90': isMenuOpen }"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16m-7 6h7"></path>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>


            <div class="hidden md:flex items-center gap-6">
                <router-link to="/login" class="text-[#121212] hover:text-[#1a3a6b] transition-colors">Sign
                    in</router-link>
                <router-link to="/register"
                    class="bg-[#072050] text-white px-6 py-2 rounded hover:bg-[#1a3a6b] transition-colors">Sign
                    up</router-link>
            </div>

            <!-- Mobile navigation menu -->
            <nav class="fixed top-16 left-0 h-full w-full bg-white shadow-2xl z-40 md:hidden transform transition-transform duration-300 ease-in-out"
                :class="{ 'translate-x-full': !isMenuOpen, 'translate-x-0': isMenuOpen }">

                <!-- Auth buttons -->
                <div class="flex items-center gap-4 flex-nowrap my-6 p-6">
                    <router-link to="/login" @click="closeMenu"
                        class="text-center text-[#121212] border border-[#072050] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Sign in
                    </router-link>
                    <router-link to="/register" @click="closeMenu"
                        class="text-center bg-[#072050] text-white px-6 py-3 rounded-lg hover:bg-[#1a3a6b] transition-colors font-medium">
                        Sign up
                    </router-link>
                </div>
                <div class="flex flex-col space-y-1">
                    <router-link to="#" @click="closeMenu"
                        class="text-[#072050] hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors text-lg font-medium">
                        Personal
                    </router-link>
                    <router-link to="#" @click="closeMenu"
                        class="text-[#072050] hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors text-lg font-medium">
                        Business
                    </router-link>
                    <router-link to="#" @click="closeMenu"
                        class="text-[#072050] hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors text-lg font-medium">
                        Company
                    </router-link>
                    <router-link to="/settings" @click="closeMenu" class="text-[#072050] hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors text-lg font-medium">Settings</router-link>
                </div>
            </nav>
        </div>


    </header>
</template>

<script>
export default {
    data() {
        return {
            isMenuOpen: false
        };
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;

            // Prevent body scroll when menu is open
            if (this.isMenuOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }
        },
        closeMenu() {
            this.isMenuOpen = false;
            document.body.style.overflow = 'unset';
        }
    },
    mounted() {
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    },
    beforeUnmount() {
        // Clean up body overflow when component is destroyed
        document.body.style.overflow = 'unset';
    }
};
</script>

<style scoped>
/* Ensure smooth transitions */
.transition-transform {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-opacity {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
    transition: color 0.2s ease, background-color 0.2s ease;
}

/* Prevent horizontal scroll when menu is animating */
body {
    overflow-x: hidden;
}
</style>