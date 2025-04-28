<template>
    <div class="bg-white p-6 shadow-lg rounded-lg">
        <div class="flex items-center justify-between mb-6 border-b pb-4">
            <h2 class="text-xl font-semibold flex items-center gap-2">
                <i class="pi pi-user"></i> Profile
            </h2>
            <button type="button" @click="goBack"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                <i class="pi pi-chevron-left mr-3"></i> Back
            </button>
        </div>

        <!-- Loader -->
        <div v-if="isLoading" class="flex justify-center items-center py-10">
            <svg aria-hidden="true" class="inline w-20 h-20 text-gray-200 animate-spin fill-blue-600"
                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908..."
                    fill="currentColor" />
            </svg>
        </div>

        <!-- Profile Form -->
        <form v-else class="max-w" @submit.prevent="handleSubmit">
            <div class="mb-5">
                <label for="first-name" class="block mb-2 text-sm font-medium text-gray-900">First Name</label>
                <input type="text" id="first-name" v-model="affiliateData.first_name"
                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 block w-full p-3"
                    required />
            </div>
            <div class="mb-5">
                <label for="last-name" class="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
                <input type="text" id="last-name" v-model="affiliateData.last_name"
                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 block w-full p-3"
                    required />
            </div>
            <div class="mb-5">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                <input type="email" id="email" v-model="affiliateData.email" disabled
                    class="shadow-sm bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-3 cursor-not-allowed" />
            </div>
            <div class="mb-5">
                <label for="paypal_email" class="block mb-2 text-sm font-medium text-gray-900">PayPal Email</label>
                <input type="email" id="paypal_email" v-model="affiliateData.paypal_email"
                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 block w-full p-3"
                    required />
            </div>
            <button type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5">Save
                Changes</button>
        </form>

        <!-- Change Password Section -->
        <div class="mt-8 border-t pt-6">
            <h2 class="text-xl font-semibold mb-4">Change Password</h2>
            <form @submit.prevent="handlePasswordChange">
                <div class="mb-5">
                    <label for="current-password" class="block mb-2 text-sm font-medium text-gray-900">Current
                        Password</label>
                    <input type="password" id="current-password" v-model="passwordData.current"
                        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 block w-full p-3"
                        required />
                </div>
                <div class="mb-5">
                    <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900">New Password</label>
                    <input type="password" id="new-password" v-model="passwordData.new"
                        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 block w-full p-3"
                        required />
                </div>
                <div class="mb-5">
                    <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">Confirm New
                        Password</label>
                    <input type="password" id="confirm-password" :toggleMask="true" v-model="passwordData.confirm"
                        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 block w-full p-3"
                        required />  
                </div>
                <button type="submit"
                    class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5">Change
                    Password</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/auth";
import { AuthService } from '@/service/AuthService';
import { rewardfulService } from "@/service/rewardfulService";
import { useToast } from 'primevue/usetoast';
import { showToast } from "../utils/Helper";

const toast = useToast();
const store = useAuthStore();
const { getUser } = storeToRefs(store);
const affiliateData = ref({ first_name: "", last_name: "", email: "" });
const passwordData = ref({ current: "", new: "", confirm: "" });
const isLoading = ref(true);

const fetchAffiliateData = async () => {
    let userId = getUser.value?.user?.id;
    if (!userId) {
        isLoading.value = false;
        return;
    }
    try {
        const affiliateId = await AuthService.getUserMeta(userId, "affiliateId", getUser.value.token);
        if (!affiliateId) {
            isLoading.value = false;
            return;
        }
        const response = await rewardfulService.getAffiliate(affiliateId);
        affiliateData.value = response.data;
    } catch (error) {
        console.error("Error fetching affiliate data:", error);
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async () => {
    try {
        isLoading.value = true;
        const { id, first_name, last_name, paypal_email } = affiliateData.value
        const response = await rewardfulService.updateAffiliate(id, { first_name, last_name, paypal_email });
        console.log("Affiliate data updated:", response);
        showToast(toast, "success", "success", "Profile updated successfully!");
    } catch (error) {
        showToast(toast, "error", "Error", "Error updating profile:" + error);
        console.error("Error updating profile:", error);
    } finally {
        isLoading.value = false; 
    }
};

const handlePasswordChange = async () => {
    if (passwordData.value.new !== passwordData.value.confirm) {
        showToast(toast, "error", "Error", "Passwords do not match!");
        return;
    }

    let userId = getUser.value?.user?.id;
    if (!userId) {
        showToast(toast, "error", "Error", "User not found!");
        return;
    }

    isLoading.value = true; 

    try {
        const payload = {
            id: userId,
            "current_password": passwordData.value.current,
            "new_password": passwordData.value.new,
            "confirm_password": passwordData.value.confirm
        };

        const response = await AuthService.changePassword(payload);
    
        if(response.success){
            showToast(toast, "success", "Success", response.message);
        }else{
            showToast(toast, "error", "Error",response.error);
        }
        passwordData.value = {
            current: "",
            new: "",
            confirm: ""
        };
    } catch (error) {
        showToast(toast, "error", "Error", "Error changing password: " + error);
        console.error("Error changing password:", error);
    } finally {
        isLoading.value = false; 
    }
};

onMounted(fetchAffiliateData);
const router = useRouter();
const goBack = () => router.back();
</script>