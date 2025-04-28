<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue';
import { rewardfulService } from "../service/rewardfulService";

import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/auth";
import { AuthService } from '@/service/AuthService';
import { PROPERTY_PROS_MARKETING_URL } from '@/utils/Enums'
import { useToast } from 'primevue/usetoast';
import { showToast } from '@/utils/Helper'

const store = useAuthStore();
const toast = useToast();
const { getUser } = storeToRefs(store);

const affiliateData = ref(null);
const campaignData = ref(null);
const isModalOpen = ref(false);
const newLinkToken = ref('');
const loading = ref(false);

const fetchAffiliateData = async () => {
    let userId = getUser.value?.user?.id;
    if (!userId) return;
    try {
        const affiliateId = await AuthService.getUserMeta(userId, "affiliateId", getUser.value.token);
        if (!affiliateId) return;
        const response = await rewardfulService.getAffiliate(affiliateId);
        affiliateData.value = response.data;
        fetchCampaignData();
    } catch (error) {
        showToast(toast, "error", "Error", error);
    }
};

const fetchCampaignData = async () => {
    if (!affiliateData.value || !affiliateData.value.campaign) return;
    const campaignId = affiliateData.value.campaign.id;
    if (!campaignId) return;
    try {
        const response = await rewardfulService.getCampaign(campaignId);
        campaignData.value = response.data;
    } catch (error) {
        showToast(toast, "error", "Error", error);
    }
};

onMounted(() => {
    fetchAffiliateData();
});

watchEffect(() => {
    console.log("Affiliate Data:", affiliateData.value);
    console.log("Campaign Data:", campaignData.value);
});

const commissionMessage = computed(() => {
    if (!campaignData.value) return "Loading commission details...";

    const commission = (campaignData.value.commission_amount_cents / 100).toFixed(2);
    const currency = campaignData.value.commission_amount_currency || "USD";

    if (campaignData.value.max_commissions && campaignData.value.max_commission_period_months) {
        return `$${commission} commission on the first ${campaignData.value.max_commissions} payments within the first ${campaignData.value.max_commission_period_months} months`;
    }

    if (campaignData.value.max_commissions) {
        return `$${commission} commission on the first ${campaignData.value.max_commissions} payments`;
    }

    return `$${commission} commission on all payments`;
});

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    }).catch((error) => {
        showToast(toast, "error", "Error", error);
    });
};

function openModal() {
    isModalOpen.value = true;
}

function closeModal() {
    isModalOpen.value = false;
    newLinkToken.value = '';
}


const createNewLink = async () => {
    if (newLinkToken.value.trim() === '') {
        showToast(toast, "error", "Error", 'Token cannot be empty!');
        return;
    }

    try {
        const userId = getUser.value?.user?.id;
        const affiliateId = await AuthService.getUserMeta(userId, "affiliateId", getUser.value.token);

        if (!affiliateId) {
            showToast(toast, "error", "Error", "Affiliate ID not found.");
            return;
        }
        loading.value = true;
        const response = await rewardfulService.createNewAffiliateLink({ affiliate_id: affiliateId, token: newLinkToken.value.trim() });

        if (response?.error) {
            showToast(toast, "error", "Error", response?.error);
            return;
        }
        closeModal();
        await fetchAffiliateData();

    } catch (error) {
        showToast(toast, "error", "Error", error);
        closeModal();
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <div class="bg-white p-6 shadow-lg rounded-lg">
        <div v-if="affiliateData">
            <div class="flex items-center justify-between mb-6 border-b pb-4">
                <h2 class="text-xl font-semibold">Dashboard</h2>
            </div>

            <div class="mb-6">
                <h5 class="text-lg font-medium mb-3">Referrals</h5>
                <table class="w-full border text-center">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-3">Visitors</th>
                            <th class="p-3">Leads</th>
                            <th class="p-3">Conversions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-t">
                            <td class="p-3">{{ affiliateData.visitors }}</td>
                            <td class="p-3">{{ affiliateData.leads }}</td>
                            <td class="p-3">{{ affiliateData.conversions }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex flex-wrap justify-between items-center mb-4">
                <h5 class="text-lg font-medium w-full sm:w-auto mb-2 sm:mb-0">Links</h5>
                <div class="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-right">
                    <strong>{{ campaignData?.name }}</strong>
                    <span class="mx-2 hidden sm:inline">•</span>
                    <br class="sm:hidden" />
                    {{ commissionMessage }}
                    <span class="mx-2 hidden sm:inline">•</span>
                    <br class="sm:hidden" />
                    Joined {{ new Date(affiliateData.created_at).toLocaleDateString() }}
                </div>
            </div>

            <div class="mb-6 overflow-x-auto">
                <table class="w-full border text-center">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-3">Link</th>
                            <th class="p-3">Actions</th>
                            <th class="p-3">Visitors</th>
                            <th class="p-3">Leads</th>
                            <th class="p-3">Conversions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-t" v-for="link in affiliateData.links" :key="link.id">
                            <td class="p-3 text-left">
                                <a class="text-blue-500"
                                    :href="PROPERTY_PROS_MARKETING_URL + 'schedule-call?via=' + link.token"
                                    target="_blank">
                                    {{ PROPERTY_PROS_MARKETING_URL + 'schedule-call?via=' + link.token }}
                                </a>
                                <p class="text-sm text-gray-600">👉 Add <code>?via={{ link.token }}</code> to any URL.
                                </p>
                            </td>
                            <td class="p-3">
                                <button
                                    @click="copyToClipboard(PROPERTY_PROS_MARKETING_URL + 'schedule-call?via=' + link.token)"
                                    class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Copy</button>
                            </td>
                            <td class="p-3">{{ link.visitors }}</td>
                            <td class="p-3">{{ link.leads }}</td>
                            <td class="p-3">{{ link.conversions }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="mb-4 text-right">
                    <button @click="openModal"
                        class="bg-green-500 text-white px-4 py-2 my-2 rounded text-sm hover:bg-green-600">
                        Create New Link
                    </button>
                </div>

            </div>
        </div>
        <div v-else class="flex justify-center items-center py-10">
            <svg aria-hidden="true" class="inline w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor" />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill" />
            </svg>
        </div>

        <div v-if="isModalOpen"
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 create_affiliate_link_modal">
            <div class="panel bg-white p-3 p-md-5 rounded-lg shadow-lg">
                <h5 class="mt-0 mb-3">Create a new link</h5>

                <form class="new_affiliate_link" id="new_affiliate_link" @submit.prevent="createNewLink">
                    <div class="mb-3">
                        <div class="input-group">
                            <span class="input-group-text">{{ PROPERTY_PROS_MARKETING_URL }}?via=</span>
                            <input v-model="newLinkToken" required autofocus placeholder="your-token"
                                pattern="[a-zA-Z0-9\-]+" class="form-control" type="text" name="affiliate_link[token]"
                                id="affiliate_link_token">

                        </div>
                        <small style="color: #3d4d5fbf; font-size: 14px;">Letters, numbers, and dashes only,
                            please.</small>
                    </div>

                    <div class="flex justify-end space-x-2 mt-4">
                        <button type="button" @click="closeModal"
                            class="bg-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-400" :disabled="loading">
                            Cancel
                        </button>

                        <button type="submit"
                            class="btn btn-primary px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600"
                            :disabled="loading">

                            <span v-if="loading">
                                <div class="flex justify-center items-center">
                                    <svg class="animate-spin h-5  mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Create Link</span>
                                </div>
                            </span>

                            <span v-else>Create Link</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>

</template>
