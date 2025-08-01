<template>
    <section class="w-full bg-gray-50">
        <section class="pt-12 pb-12 sm:pb-16 lg:pt-8">
            <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div
                    class="grid max-w-5xl mx-auto grid-cols-1 gap-y-12 lg:max-w-full lg:grid-cols-2 lg:items-center lg:gap-x-16">
                    <div class="text-center lg:text-left">
                        <h1 class="text-4xl font-bold leading-tight text-[#121212] sm:text-5xl lg:text-6xl">
                            Your financial partner for a brighter future
                        </h1>
                        <p class="mt-4 text-lg text-gray-600 sm:mt-8 max-w-md w-full">
                            Make free transfers, enjoy cashless payment options and earn interest on your savings with
                            Banka
                        </p>
                        <div class="mt-10">
                            <router-link to="/register"
                                class="bg-[#072050] text-white px-12 py-4 rounded hover:bg-[#1a3a6b] transition-colors">Get
                                Started Now
                            </router-link>
                        </div>
                    </div>

                    <!-- Hero Image -->
                    <div>
                        <img class="w-full h-auto" src="../../assets/img/hero.png"
                            alt="Financial growth illustration" />
                    </div>

                </div>
            </div>
        </section>
    </section>
</template>

<script setup>
// Nothing here yet
</script>

<style>
/* Add custom styles if needed */
</style>
