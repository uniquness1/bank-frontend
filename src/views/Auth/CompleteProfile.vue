<template>
    <section>
        <Header />
        <section class="bg-gray-50">
            <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                <div class="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8 sm:py-16">
                    <div class="w-full max-w-sm mx-auto 2xl:max-w-md">
                        <h2 class="text-2xl lg:text-3xl font-bold text-[#121212] mb-3">Complete Your Profile</h2>
                        <p class="text-[#121212] leading-relaxed">
                            Create a banka profile with few details. Your password must be at least 8 characters
                            including
                            letters and a number.
                        </p>
                        <form @submit.prevent="handleCompleteProfile" class="mt-6 space-y-4">
                            <div>
                                <label for="firstName" class="text-base font-medium text-[#121212]">First Name</label>
                                <div class="mt-1">
                                    <input v-model="form.firstName" type="text" id="firstName"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:outline-none"
                                        placeholder="Enter First Name" autocomplete="first name"
                                        :class="{ 'border-red-500': errors.firstName }" required />
                                    <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label for="lastName" class="text-base font-medium text-[#121212]">Last Name</label>
                                <div class="mt-1">
                                    <input v-model="form.lastName" type="text" id="lastName"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:outline-none"
                                        placeholder="Enter Last Name" autocomplete="last name"
                                        :class="{ 'border-red-500': errors.lastName }" required />
                                    <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label for="username" class="text-base font-medium text-[#121212]">Username</label>
                                <div class="mt-1">
                                    <input v-model="form.userName" type="text" id="userName"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:outline-none"
                                        placeholder="Enter User Name" autocomplete="nickname"
                                        :class="{ 'border-red-500': errors.userName }" required />
                                    <p v-if="errors.userName" class="text-red-500 text-xs mt-1">{{ errors.userName }}
                                    </p>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label for="phone" class="text-base font-medium text-[#121212]">Phone</label>
                                <div class="mt-1">
                                    <input v-model="form.phone" type="tel" id="phone"
                                        class="block w-full px-4 py-3 text-black border-[#dcdcdc] border rounded-md outline-none focus:outline-none"
                                        placeholder="Enter Phone Number" autocomplete="phone"
                                        :class="{ 'border-red-500': errors.phone }" required />
                                    <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
                                </div>
                            </div>
                            <button type="submit"
                                class="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-black rounded-md  disabled:cursor-not-allowed cursor-pointer"
                                :disabled="loading">
                                {{ loading ? "Submitting..." : "Complete Profile" }}
                            </button>
                        </form>
                    </div>
                </div>
                <div class="hidden md:block max-h-[100vh]">
                    <img class="w-[80%] h-full" src="../../assets/img/hero.png" alt="Banka Flowers" />
                </div>
            </div>
        </section>
    </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/composables/useApi";
import Cookies from "js-cookie";
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import Header from "@/components/utils/Header.vue";

const router = useRouter();
const form = ref({
    firstName: "",
    lastName: "",
    userName: "",
    phone: "",
    role: "user",
});
const errors = ref({});
const error = ref("");
const loading = ref(false);

const validateForm = () => {
    errors.value = {};
    if (!form.value.firstName.trim()) errors.value.firstName = "First name is required";
    if (!form.value.lastName.trim()) errors.value.lastName = "Last name is required";
    if (!form.value.userName.trim()) errors.value.userName = "Username is required";
    if (!/^\d{10,15}$/.test(form.value.phone)) errors.value.phone = "Phone must be 10-15 digits";
    return Object.keys(errors.value).length === 0;
};

const handleCompleteProfile = async () => {
    if (!validateForm()) return;
    loading.value = true;
    error.value = "";
    try {
        const token = Cookies.get("authToken");
        if (!token) {
            throw new Error("No authentication token found");
        }
        const response = await api.post("/auth/complete-profile", form.value, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        toast.success('profile completed successfully!', {
            autoClose: 2000,
            position: 'bottom-right',
        })
        setTimeout(() => {
            router.push("/set-pin");
        }, 2000)
    } catch (err) {
        console.error("Complete profile error:", err.message, err.response?.data);
        const message = err.response?.data?.error || "Failed to complete profile. Please try again.";
        toast.error(message, {
            autoClose: 2000,
            position: 'bottom-right',
        })
    } finally {
        loading.value = false;
    }
};
</script>